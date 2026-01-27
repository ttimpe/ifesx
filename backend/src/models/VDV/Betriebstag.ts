import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript"
import { Tagesart } from "./Tagesart"
import { BasisVersion } from "./BasisVersion"

@Table({
    timestamps: false,
    tableName: 'FIRMENKALENDER'
})
export class Betriebstag extends Model {
    @PrimaryKey
    @Column(DataType.INTEGER)
    BASIS_VERSION!: number

    @BelongsTo(() => BasisVersion, { foreignKey: 'BASIS_VERSION', targetKey: 'BASIS_VERSION' })
    basisVersion?: BasisVersion

    @PrimaryKey
    @Column(DataType.INTEGER)
    BETRIEBSTAG!: number

    @Column(DataType.STRING)
    BETRIEBSTAG_TEXT!: string

    @PrimaryKey
    @Column(DataType.INTEGER)
    TAGESART_NR!: number

    @BelongsTo(() => Tagesart, { foreignKey: 'TAGESART_NR', targetKey: 'TAGESART_NR' })
    tagesart?: Tagesart
}