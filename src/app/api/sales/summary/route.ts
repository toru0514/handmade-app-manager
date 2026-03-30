import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import type {
  PlatformValue,
  PlatformSalesDto,
  MonthlySalesDto,
  ProductSalesDto,
  SalesOrderDto,
  SalesSummaryDto,
} from "@/types/sales";
import { PlatformValues } from "@/types/sales";

export const dynamic = "force-dynamic";

interface OrderRow {
  order_id: string;
  platform: string;
  buyer_name: string;
  product_name: string | null;
  product_price: number;
  products_json: { name: string; price: number; quantity: number }[] | null;
  shipped_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const startDate = searchParams.get("startDate") ?? `${now.getFullYear()}-01-01`;
    const endDate =
      searchParams.get("endDate") ??
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const platformParam = searchParams.get("platform") ?? "all";

    // プラットフォームパラメータの検証
    if (platformParam !== "all" && !PlatformValues.includes(platformParam as PlatformValue)) {
      return Response.json(
        { error: `不正なプラットフォームです: ${platformParam}（minne / creema / all のみ対応）` },
        { status: 400 },
      );
    }
    const platform: PlatformValue | "all" = platformParam as PlatformValue | "all";

    const supabase = await createSupabaseServerClient();

    // DB側でフィルタリング
    let query = supabase
      .from("orders")
      .select("order_id, platform, buyer_name, product_name, product_price, products_json, shipped_at")
      .eq("status", "shipped")
      .gte("shipped_at", `${startDate}T00:00:00`)
      .lte("shipped_at", `${endDate}T23:59:59`)
      .order("shipped_at", { ascending: false });

    if (platform !== "all") {
      query = query.eq("platform", platform);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return Response.json({ error: "売上データの取得に失敗しました" }, { status: 500 });
    }

    const rows = (orders ?? []) as OrderRow[];
    const summary = buildSummary(rows, startDate, endDate);

    return Response.json(summary);
  } catch (err) {
    console.error("売上集計取得エラー:", err);
    return Response.json({ error: "売上集計の取得に失敗しました" }, { status: 500 });
  }
}

function getOrderTotalPrice(row: OrderRow): number {
  if (row.products_json && row.products_json.length > 0) {
    return row.products_json.reduce((sum, p) => sum + p.price * p.quantity, 0);
  }
  return row.product_price ?? 0;
}

function getProducts(row: OrderRow): { name: string; price: number; quantity: number; subtotal: number }[] {
  if (row.products_json && row.products_json.length > 0) {
    return row.products_json.map((p) => ({
      name: p.name,
      price: p.price,
      quantity: p.quantity,
      subtotal: p.price * p.quantity,
    }));
  }
  if (row.product_name) {
    return [
      {
        name: row.product_name,
        price: row.product_price ?? 0,
        quantity: 1,
        subtotal: row.product_price ?? 0,
      },
    ];
  }
  return [];
}

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toYearMonth(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

function generateMonthRange(startDate: string, endDate: string): string[] {
  const months: string[] = [];
  const [startYear, startMonth] = startDate.split("-").map(Number);
  const [endYear, endMonth] = endDate.split("-").map(Number);

  let year = startYear;
  let month = startMonth;

  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push(`${year}-${String(month).padStart(2, "0")}`);
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return months;
}

function stripOptionSuffix(name: string): string {
  return name.replace(/\s*[\(（].*?[\)）]\s*$/, "");
}

function buildSummary(rows: OrderRow[], startDate: string, endDate: string): SalesSummaryDto {
  // 基本集計
  const totalSales = rows.reduce((sum, row) => sum + getOrderTotalPrice(row), 0);
  const totalOrders = rows.length;
  const pricedOrders = rows.filter((row) => getOrderTotalPrice(row) > 0);
  const averageOrderValue = pricedOrders.length > 0 ? Math.round(totalSales / pricedOrders.length) : 0;

  // プラットフォーム別集計
  const pfMap: Record<string, { totalSales: number; orderCount: number }> = {
    minne: { totalSales: 0, orderCount: 0 },
    creema: { totalSales: 0, orderCount: 0 },
  };
  for (const row of rows) {
    const pf = row.platform;
    if (pfMap[pf]) {
      pfMap[pf].totalSales += getOrderTotalPrice(row);
      pfMap[pf].orderCount += 1;
    }
  }
  const platformBreakdown: PlatformSalesDto[] = PlatformValues.map((pf) => ({
    platform: pf,
    totalSales: pfMap[pf]?.totalSales ?? 0,
    orderCount: pfMap[pf]?.orderCount ?? 0,
  }));

  // 月別集計
  const months = generateMonthRange(startDate, endDate);
  const monthlyMap: Record<string, { totalSales: number; orderCount: number }> = {};
  for (const m of months) {
    monthlyMap[m] = { totalSales: 0, orderCount: 0 };
  }
  for (const row of rows) {
    const ym = toYearMonth(row.shipped_at);
    if (monthlyMap[ym]) {
      monthlyMap[ym].totalSales += getOrderTotalPrice(row);
      monthlyMap[ym].orderCount += 1;
    }
  }
  const monthlyBreakdown: MonthlySalesDto[] = months.map((ym) => ({
    yearMonth: ym,
    totalSales: monthlyMap[ym].totalSales,
    orderCount: monthlyMap[ym].orderCount,
  }));

  // 商品別集計
  const productMap = new Map<string, { totalSales: number; totalQuantity: number; orderCount: number }>();
  for (const row of rows) {
    const products = getProducts(row);
    const countedProducts = new Set<string>();
    for (const product of products) {
      const name = stripOptionSuffix(product.name);
      const existing = productMap.get(name) ?? { totalSales: 0, totalQuantity: 0, orderCount: 0 };
      existing.totalSales += product.subtotal;
      existing.totalQuantity += product.quantity;
      if (!countedProducts.has(name)) {
        existing.orderCount += 1;
        countedProducts.add(name);
      }
      productMap.set(name, existing);
    }
  }
  const productBreakdown: ProductSalesDto[] = Array.from(productMap.entries())
    .map(([productName, data]) => ({
      productName,
      totalSales: data.totalSales,
      totalQuantity: data.totalQuantity,
      orderCount: data.orderCount,
      priceMissing: data.totalSales === 0 && data.totalQuantity > 0,
    }))
    .sort((a, b) => b.totalSales - a.totalSales);

  // 注文一覧
  const orders: SalesOrderDto[] = rows.map((row) => {
    const totalPrice = getOrderTotalPrice(row);
    const products = getProducts(row);
    return {
      orderId: row.order_id,
      platform: row.platform,
      buyerName: row.buyer_name ?? "",
      productName: products.map((p) => p.name).join("、"),
      totalPrice,
      shippedAt: row.shipped_at,
      priceMissing: totalPrice === 0,
    };
  });

  const ordersWithMissingPrice = orders.filter((o) => o.priceMissing).length;

  return {
    totalSales,
    totalOrders,
    averageOrderValue,
    ordersWithMissingPrice,
    platformBreakdown,
    monthlyBreakdown,
    productBreakdown,
    orders,
  };
}
