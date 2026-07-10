import { apiClient } from "./apiClient";

export interface BookingCalculation {
  sizeSft: number;
  baseSqftRate: number;
  baseAmount: number;
  premiumCharge: number;
  totalPrice: number;
  bookingPct: number;
  bookingAmount: number;
}

export interface ReserveUnitResponse {
  invoiceNumber: string;
  amountBdt: number;
  unitNumber: string;
  projectName: string;
  calculation: BookingCalculation;
}

export async function reserveUnit(unitId: number, projectId: string): Promise<ReserveUnitResponse> {
  const { data } = await apiClient.post<ReserveUnitResponse>("/investor/bookings/reserve", {
    unit_id:    unitId,
    project_id: parseInt(projectId, 10),
  });
  return data;
}

export async function initiatePayment(invoiceNumber: string, gateway: "bkash" | "nagad" | "bank"): Promise<{
  invoiceNumber: string;
  amountBdt: number;
  gateway: string;
  redirectUrl: string;
}> {
  const { data } = await apiClient.post("/investor/payments/initiate", {
    invoice_number: invoiceNumber,
    gateway,
  });
  return data;
}
