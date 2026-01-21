import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { BasisVersion } from "./BasisVersion";
import { RecUeb } from "./RecUeb";

@Table({
    tableName: 'UEB_FZT',
    timestamps: false
})
export class UebFzt extends Model {
    @PrimaryKey
    @ForeignKey(() => BasisVersion)
    @Column({
        type: DataType.INTEGER,
        defaultValue: 1
    })
    BASIS_VERSION!: number;

    @PrimaryKey
    @ForeignKey(() => RecUeb)
    @Column(DataType.INTEGER)
    BEREICH_NR!: number;

    @PrimaryKey
    @Column(DataType.INTEGER)
    FGR_NR!: number;

    @PrimaryKey
    @Column(DataType.INTEGER)
    TAGESART_NR!: number;

    @PrimaryKey
    @ForeignKey(() => RecUeb)
    @Column(DataType.INTEGER)
    ONR_TYP_NR!: number;

    @PrimaryKey
    @ForeignKey(() => RecUeb)
    @Column(DataType.INTEGER)
    ORT_NR!: number;

    @PrimaryKey
    @ForeignKey(() => RecUeb)
    @Column(DataType.INTEGER)
    UEB_ZIEL_TYP!: number;

    @PrimaryKey
    @ForeignKey(() => RecUeb)
    @Column(DataType.INTEGER)
    UEB_ZIEL!: number;

    @Column(DataType.INTEGER)
    UEB_FAHRZEIT!: number; // Transfer Time (seconds)

    @BelongsTo(() => RecUeb, {
        foreignKey: 'BASIS_VERSION', // Simplification, composite key logic in Sequelize is tricky, usually handled by matching all PKs manually
        targetKey: 'BASIS_VERSION',
        constraints: false
    })
    recUeb?: RecUeb;
}
