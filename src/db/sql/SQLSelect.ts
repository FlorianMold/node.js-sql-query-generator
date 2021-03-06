import { SQLElementType } from "./enums/SQLElementType";
import { SQLAttributes } from "./SQLAttributes";
import { SQLElement } from "./SQLElement";

/**
 * Class that represents the select-part of a sql-query.
 */
export class SQLSelect extends SQLElement {
    private readonly _attributes: SQLAttributes;

    /**
     * @param attributes attributes that should be selected
     */
    public constructor(attributes: SQLAttributes) {
        super();
        this._attributes = attributes;
    }

    /**
     * Returns the element-type.
     */
    public getElementType(): number {
        return SQLElementType.SQLSelect;
    }

    /**
     * Returns the sql-string for the select-part.
     */
    public getSQL(): string {
        return "SELECT " + this._attributes.getCommaSeparatedNames() + " ";
    }
}
