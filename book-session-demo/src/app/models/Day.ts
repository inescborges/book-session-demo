export interface Day {
    day: Date;
    timeslots: TimeSlot[];
}
export interface TimeSlot {
    time: string;
    scheduled: boolean;
}