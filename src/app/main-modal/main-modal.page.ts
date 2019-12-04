import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-main-modal',
  templateUrl: './main-modal.page.html',
  styleUrls: ['./main-modal.page.scss'],
})
export class MainModalPage implements OnInit {

  modalTitle: string;
  //modelId: number;
  contact1 = 'Fallen';
  contact2 = 'Adam';
  contact3 = 'Eve';

  constructor(
    private modalController: ModalController,
    private navParams: NavParams
  ) { }

  ngOnInit() {
    console.table(this.navParams);
    this.modalTitle = "Create New Chat";
  }

  async closeModal() {
    const onClosedData: string = "Wrapped Up!";
    await this.modalController.dismiss(onClosedData);
  }
}
