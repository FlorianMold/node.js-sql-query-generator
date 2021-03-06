import { EntityFacade } from "./EntityFacade";
import { Filter } from "./db/filter/Filter";
import { Ordering } from "./db/order/Ordering";
import { SQLOperator } from "./db/sql/enums/SQLOperator";
import { AbstractModel } from "./db/AbstractModel";
import {Query} from "./db/Query";

/**
 * Base class for composite facades
 * Provides methods that can handle multiple filters and multiple order-bys
 */
export abstract class CompositeFacade<EntityType extends AbstractModel> extends EntityFacade<EntityType> {

    private _sqlOperator: SQLOperator = SQLOperator.AND;
    private _autoCombineFilter = true;

    /**
     * @param tableName table-name of the facade
     * @param tableAlias table-alias of the facade
     */
    protected constructor(tableName: string, tableAlias: string) {
        super(tableName, tableAlias);
    }

    /**
     * Returns an entity by id.
     * Before the execution of the select-query all order-bys of the composite-facade are combined.
     *
     * @param id id of the entity that should be retrieved
     * @param excludedSQLAttributes attributes that should be excluded from select-query
     */
    public getById(id: number, excludedSQLAttributes?: string[]): Query {
        this.combineOrderBys();
        return super.getById(id, excludedSQLAttributes);
    }

    /**
     * Returns all entities that match the specified filter.
     * Before the execution of the select-query all filters of the composite-facade are
     * combined the option is enabled. Afterwards all order-bys of the composite-facade are combined.
     *
     * @param excludedSQLAttributes attributes that should be excluded from select-query
     */
    public get(excludedSQLAttributes?: string[]): Query {
        if (this._autoCombineFilter) {
            this.combineFilters();
        }

        this.combineOrderBys();

        return super.get(excludedSQLAttributes);
    }

    /**
     * Returns all sub facade-filters of the composite-facade as an array.
     */
    protected abstract get filters(): Filter[];

    /**
     * Clears every filter of the composite-facade.
     */
    public clearFacadeFilters(): void {
        for (const filter of this.filters) {
            filter.clear();
        }
    }

    /**
     * Combines the composite-facade filters to one filter with the specified sql-operator.
     */
    private combineFilters(): void {
        const compositeFacadeFilters: Filter[] = this.filters;
        const newFilter: Filter = new Filter(this.tableAlias);
        const facadeFilter: Filter = this.filter;

        compositeFacadeFilters.push(facadeFilter);

        for (const filter of compositeFacadeFilters) {
            if (!filter.isEmpty) {
                newFilter.addSubFilter(filter);
                newFilter.addOperator(this._sqlOperator);
            }
        }

        this.filter = newFilter;
    }

    /**
     * Sql-operator to automatically combine composite-filters with.
     *
     * @param value operator for combining filters
     */
    set sqlOperator(value: SQLOperator) {
        this._sqlOperator = value;
    }

    /**
     * Enables automatic combination of the composite filters with specified sql-operator.
     *
     * @param value determines if the filters should be auto-combined with
     */
    set autoCombineFilter(value: boolean) {
        this._autoCombineFilter = value;
    }

    /**
     * Returns all sub facade order-bys of the facade as an array.
     */
    protected abstract get orderBys(): Ordering[];

    /**
     * Combines the composite facade order-bys to one order-by.
     */
    private combineOrderBys(): void {
        const compositeFacadeOrdering: Ordering[] = this.orderBys;
        const newOrdering = new Ordering(this.tableAlias);
        const facadeOrdering = this.ordering;

        newOrdering.addOrdering(facadeOrdering);

        for (const ordering of compositeFacadeOrdering) {
            newOrdering.addOrdering(ordering);
        }

        this.ordering = newOrdering;
    }
}
