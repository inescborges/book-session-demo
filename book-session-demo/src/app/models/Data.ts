export interface Data {
    id: number;
    name: string;
    specialty: string;
    city: string;
    reviews: number[];
    appointment: Appointment;
    description: string;
    busySlots: TimeSlot [];
}
interface Appointment {
    charge: number;
    duration: number;
}
export interface TimeSlot {
    day: Date;
    hour: string;
}