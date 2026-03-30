// プラットフォーム型
export type PlatformValue = "minne" | "creema";
export const PlatformValues: PlatformValue[] = ["minne", "creema"];

// プラットフォーム別集計DTO
export interface PlatformSalesDto {
  readonly platform: PlatformValue;
  readonly totalSales: number;
  readonly orderCount: number;
}

// 月別集計DTO
export interface MonthlySalesDto {
  readonly yearMonth: string; // YYYY-MM
  readonly totalSales: number;
  readonly orderCount: number;
}

// 商品別集計DTO
export interface ProductSalesDto {
  readonly productName: string;
  readonly totalSales: number;
  readonly totalQuantity: number;
  readonly orderCount: number;
  readonly priceMissing: boolean;
}

// 注文一覧DTO
export interface SalesOrderDto {
  readonly orderId: string;
  readonly platform: string;
  readonly buyerName: string;
  readonly productName: string;
  readonly totalPrice: number;
  readonly shippedAt: string;
  readonly priceMissing: boolean;
}

// 出力DTO
export interface SalesSummaryDto {
  readonly totalSales: number;
  readonly totalOrders: number;
  readonly averageOrderValue: number;
  readonly ordersWithMissingPrice: number;
  readonly platformBreakdown: PlatformSalesDto[];
  readonly monthlyBreakdown: MonthlySalesDto[];
  readonly productBreakdown: ProductSalesDto[];
  readonly orders: SalesOrderDto[];
}
