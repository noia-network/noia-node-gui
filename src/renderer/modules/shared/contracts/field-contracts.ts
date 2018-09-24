export interface FieldBaseProps<TValue = string> {
    name: string;
    value?: TValue;
    defaultValue?: TValue;
    disabled?: boolean;
    // tslint:disable-next-line:no-any
    onChange?: unknown;
}

export interface HtmlFieldBaseProps<TElement, TValue = string> extends FieldBaseProps<TValue> {
    onChange?: React.ChangeEventHandler<TElement>;
}
