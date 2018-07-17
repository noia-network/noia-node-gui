import { Injectable, EventEmitter } from "@angular/core";
import { ToastrService } from "ngx-toastr";

@Injectable()
export class UtilsService {
    
    public DiskChecked = new EventEmitter<number>();

    constructor(private toastrService: ToastrService){}

    transformDataAndUnits(bytesTotal: number) {
        let bytes: number;
        let units: string;
        const B = 1;
        const kB = 1024 * B;
        const MB = 1024 * kB;

        if (bytesTotal <= kB) {
            units = "B";
            bytes = bytesTotal;
        } else if (bytesTotal <= MB) {
            units = "kB";
            bytes = Math.round(bytesTotal / kB);
        } else {
            units = "MB";
            bytes = Math.round(bytesTotal / MB);
        }

        return { bytes: bytes, units: units };
    }

    transformToBytes(bytesTransformed: number, units: string) {
        let bytesTotal: number;

        const B = 1;
        const kB = 1024 * B;
        const MB = 1024 * kB;

        const lowerCaseUnits: string = units.toLowerCase()

        if (lowerCaseUnits === "B") {
            bytesTotal = bytesTransformed * B;
        } else if (lowerCaseUnits === "kb" || lowerCaseUnits === "k") {
            bytesTotal = bytesTransformed * kB;
        } else if (lowerCaseUnits === "mb" || lowerCaseUnits === "m") {
            bytesTotal = bytesTransformed * MB;
        } else {
            bytesTotal = bytesTransformed * B;
        }

        return bytesTotal;
    }

    splitBytesString(bytesString) {        
        const bytes = Number(bytesString.match(/\d+/)[0]);
        const units = bytesString.match(/[a-zA-Z]+/)[0];

        return { bytes: bytes, units: units };
    }

    getFreeSpace(storagePath: string) {
        let path:string;

        if (window.require("os").platform() === 'win32'){
            path = (storagePath.split(":")[0]).toUpperCase() + ":/";
        }
        else {
            path = "/";
        }

        const disksusage = window.require("diskusage-ng");
        disksusage(path, (error, info) => {
            if (error){
                this.toastrService.warning("Cannot get storage disk space")
                this.DiskChecked.emit(1000000000000);
                return;  
            }

            this.DiskChecked.emit(info.available);
        });
    }
}
