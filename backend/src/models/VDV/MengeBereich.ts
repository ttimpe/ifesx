import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { BasisVersion } from "./BasisVersion";

@Table({
    tableName: 'MENGE_BEREICH',
    timestamps: false
})
export class MengeBereich extends Model {
    @PrimaryKey
    @ForeignKey(() => BasisVersion)
    @Column({
        type: DataType.INTEGER,
        defaultValue: 1
    })
    BASIS_VERSION!: number;

    @PrimaryKey
    @Column(DataType.INTEGER)
    BEREICH_NR!: number;

    @Column(DataType.STRING(6))
    STR_BEREICH?: string;

    @Column(DataType.STRING(40))
    BEREICH_TEXT?: string;

    @BelongsTo(() => BasisVersion, { foreignKey: 'BASIS_VERSION', targetKey: 'BASIS_VERSION', constraints: false })
    basisVersion?: BasisVersion;
}
