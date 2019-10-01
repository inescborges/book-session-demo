import { Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
import { faChevronCircleLeft, faChevronCircleRight, faStar } from '@fortawesome/free-solid-svg-icons';
import { RestService } from './rest.service';
import { Data } from './models/Data';
import { Day, TimeSlot } from './models/Day';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  public faChevronCircleLeft = faChevronCircleLeft;
  public faChevronCircleRight = faChevronCircleRight;
  public faStar = faStar;
  public modalRefConfirm: BsModalRef;
  public modalRefSlots: BsModalRef;
  private data: Data;
  public date = moment();
  public days: Day[];
  private selectedTime;
  public calendarStart: boolean;
  public slotsToShow: number;
  public maxStars;
  private modalDay: Day;
  public avReviews: number[];

  constructor(private dataService: RestService, private modalService: BsModalService) { }

  ngOnInit() {
    this.calendarStart = true;
    this.slotsToShow = 6;
    this.maxStars = 5;
    this.fetchData();
  }

  private fetchData(){
    const promise = this.dataService.getData();
    promise.then((data)=>{
      console.log("Promise resolved");
      this.data = data;
      this.avReviews = this.calcAverageValue(this.data.reviews);
      this.days = this.createCalendar(this.date);
    }).catch((error)=>{
      console.log("Promise rejected with " + JSON.stringify(error));
    });
  }

  openModalConfirm(template: TemplateRef<any>) {
    this.modalRefConfirm = this.modalService.show(template);
  }
  openModalSlots(template: TemplateRef<any>) {
    this.modalRefSlots = this.modalService.show(template);
  }

  //average reviews calculation
  calcAverageValue(reviews: number[]) {
    let sum = 0;
    let average;
    for(let i = 0; i < reviews.length; i++) {
      sum = sum + reviews[i];
    }
    average = Math.round(sum/reviews.length)
    return new Array(average);
  }

  // check if given day is today
  isToday(day) {
    if(!day) {
      return false;
    }
    return moment().format('L') === day.format('L');
  }

  // creates calendar starting from today
  createCalendar(date) {
    let firstDay = date;
    let days = Array.apply(null, {length: 4})
    .map(Number.call, Number)
    .map(d => {
      return { day: moment(firstDay).add(d, 'd'), timeslots: this.createTimeSlots(moment(firstDay).add(d, 'd')) }
    });
    return days;
  }

  // shows calendar with one day forward
  public nextDay() {
    this.date.add(1, 'd');
    this.days = this.createCalendar(this.date);
    this.calendarStart = false;
  }

  // shows calendar with one day back
  public previousDay() {
    if (!this.isToday(this.days[0].day)) {
      this.date.subtract(1, 'd');
      this.days = this.createCalendar(this.date);
      if (!this.isToday(this.days[0].day)) {
        this.calendarStart = false;
      } else {
        this.calendarStart = true;
      }
    }
  }
  
  // creates time slots for each day
  createTimeSlots(day) {
    let startTime = moment('08:00', 'HH:mm');
    let endTime = moment('16:30', 'HH:mm');
    let timeSlots: TimeSlot[] = [];
    while (startTime <= endTime) {
      if(this.isToday(day)) {
        timeSlots.push({
          time: '-',
          scheduled: false });
      } else if (this.isScheduled(startTime, day)) {
        timeSlots.push({
          time: moment(startTime).format('HH:mm'),
          scheduled: true });
      } else {
        timeSlots.push({
          time: moment(startTime).format('HH:mm'),
          scheduled: false });
      }
      startTime.add(30, 'minutes');
    }
    return timeSlots;
  }

  // checks if time slot is scheduled
  isScheduled(time, day) {
    time = moment(time).format('HH:mm');
    day = moment(day).format('l');
    let isScheduled = false;
    if (this.data.busySlots.length > 0) {
      for (let i = 0; i < this.data.busySlots.length; i++) {
        if (this.data.busySlots[i].day === day && this.data.busySlots[i].hour === time) {
          isScheduled = true;
        }
      }
    }
    return isScheduled;
  }

  // opens a confimation modal on a time slot click
  selectSlot(slot, day, template) {
    this.modalDay = day;
    if(slot.scheduled === false) {
      this.selectedTime = slot.time;
      this.openModalConfirm(template);
    }
  }

  // opens a confimation modal on a time slot click
  showMoreSlots(day, moreSlots) {
    this.modalDay = day;
    this.openModalSlots(moreSlots);
  }

  // opens a modal with the remaining time slots
  scheduleTime() {
    let dayIndex = this.days.findIndex(e => e.day === this.modalDay.day);
    let timeIndex = this.modalDay.timeslots.findIndex(e => e.time === this.selectedTime);
    if (!!this.selectedTime) {
      this.dataService.updateData(this.data.id, moment(this.modalDay.day).format('l'), this.selectedTime).subscribe(res => {   
        console.log("Request successful ");
        this.days[dayIndex].timeslots[timeIndex].scheduled = true;
        this.selectedTime = '';
        }, 
        error  => {
        console.log("Error", error);
        }
        );
    }
  }
}
