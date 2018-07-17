import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    ChangeDetectorRef
} from "@angular/core";
import { UtilsService } from "../../providers/utils.service";

@Component({
    selector: "input-slider",
    templateUrl: "./input-slider.component.html",
    styleUrls: ["./input-slider.component.scss"]
})
export class InputSliderComponent implements OnInit {
    @Input() label: string;
    @Input() callback: Function;
    @Input() value: number;
    @Input() isStorage: boolean;
    @Input() minValue: number;
    @Input() maxValue: number;
    @Output() valueChange = new EventEmitter<number>();

    inputValue: string;
    minValueTransformed: string;
    maxValueTransformed: string;

    constructor(private utilsService: UtilsService) {}

    ngOnInit() {
        const bytesObject = this.utilsService.transformDataAndUnits(this.value);
        this.inputValue = bytesObject.bytes + bytesObject.units;

        const minBytesOject = this.utilsService.transformDataAndUnits(this.minValue);    
        this.minValueTransformed = minBytesOject.bytes + minBytesOject.units;

        const maxBytesOject =  this.utilsService.transformDataAndUnits(this.maxValue);    
        this.maxValueTransformed = maxBytesOject.bytes + maxBytesOject.units;
    }

    ngOnChanges(changes) {
        if (!changes.maxValue)
            return;

        const maxBytesOject = this.utilsService.transformDataAndUnits(this.maxValue);    
        this.maxValueTransformed = maxBytesOject.bytes + maxBytesOject.units;

        //Workaround to update input's value after changing min/max values.
        this.value += 1;
    }

    onSliderChange(event) {
        const value = event.target.value;

        if (this.isStorage) {
            const bytesObject = this.utilsService.transformDataAndUnits(value);
            this.inputValue = bytesObject.bytes + bytesObject.units;
        } else {
            this.inputValue = value;
        }

        this.valueChange.emit(value);
    }

    onInputChange(event) {
        const value = event.target.value;
        let totalBytes: number;

        if (this.isStorage) {
            const validatedSize = value.match(/^\d+((b|B]){1}|([k|m|g|t|K|M|G|T]{1}[b|B]{1}))$/);

            if (!validatedSize) {
                this.valueChange.emit(-1);
                return;
            }

            const bytesObject = this.utilsService.splitBytesString(value);
            totalBytes = this.utilsService.transformToBytes(bytesObject.bytes, bytesObject.units);
            this.value = totalBytes;
        } else {
            this.value = event.target.value;
            totalBytes = event.target.value;
        }

        this.valueChange.emit(totalBytes);
    }
}
