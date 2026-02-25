import { NextRequest, NextResponse } from "next/server";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";
import {
  insertAppointmentSchema,
} from "@shared/schema";
import { getStorage } from "../../../server/storage/repository";

export async function GET() {
  try {
    const storage = await getStorage();
    const appointments = await storage.getAppointments();
    return NextResponse.json(appointments, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch appointments" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = insertAppointmentSchema.parse(body);
    const storage = await getStorage();
    const appointment = await storage.createAppointment(data);
    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return NextResponse.json(
        { message: validationError.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Failed to create appointment" },
      { status: 500 },
    );
  }
}
