import { Injectable } from "@angular/core";
import { Human } from "../models/human";

@Injectable({
    providedIn : 'root'
})
export class HumanService {
    private humans: Human[] = [];
    constructor(){}
    addHuman(human: Human){
        this.humans.push(human);
    }

    getHumans(){
         return this.humans;
    }
}