import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { BasisVersion } from "./BasisVersion";
import { Einzelanschluss } from "./Einzelanschluss";

@Table({
    tableName: 'REC_UMS',
    timestamps: false
})
export class RecUms extends Model {
    @PrimaryKey
    @ForeignKey(() => BasisVersion)
    @Column({
        type: DataType.INTEGER,
        defaultValue: 1
    })
    BASIS_VERSION!: number;

    @PrimaryKey
    @ForeignKey(() => Einzelanschluss)
    @Column(DataType.INTEGER)
    EINAN_NR!: number;

    @PrimaryKey
    @Column(DataType.INTEGER)
    TAGESART_NR!: number;

    @PrimaryKey
    @Column(DataType.INTEGER)
    UMS_BEGINN!: number; // Seconds from midnight

    @PrimaryKey
    @Column(DataType.INTEGER)
    UMS_ENDE!: number; // Seconds from midnight

    @Column(DataType.INTEGER)
    UMS_MIN!: number; // Min transfer time (seconds)

    @Column({
        type: DataType.INTEGER,
        defaultValue: 65532
    })
    UMS_MAX!: number; // Max transfer time (seconds) - Default VDV

    @Column({
        type: DataType.INTEGER,
        defaultValue: 65532
    })
    MAX_VERZ_MAN!: number; // Max Delay Manual

    @Column({
        type: DataType.INTEGER,
        defaultValue: 65532
    })
    MAX_VERZ_AUTO!: number; // Max Delay Auto

    @BelongsTo(() => Einzelanschluss, {
        foreignKey: 'EINAN_NR',
        targetKey: 'EINAN_NR',
        constraints: false
    })
    einzelanschluss?: Einzelanschluss;
}
