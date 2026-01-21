import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { BasisVersion } from "./BasisVersion";
import { UebFzt } from "./UebFzt";

@Table({
    tableName: 'REC_UEB',
    timestamps: false
})
export class RecUeb extends Model {
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

    @PrimaryKey
    @Column(DataType.INTEGER)
    ONR_TYP_NR!: number;

    @PrimaryKey
    @Column(DataType.INTEGER)
    ORT_NR!: number;

    @PrimaryKey
    @Column(DataType.INTEGER)
    UEB_ZIEL_TYP!: number;

    @PrimaryKey
    @Column(DataType.INTEGER)
    UEB_ZIEL!: number;

    @Column(DataType.INTEGER)
    UEB_LAENGE?: number;

    @BelongsTo(() => BasisVersion, { foreignKey: 'BASIS_VERSION', targetKey: 'BASIS_VERSION', constraints: false })
    basisVersion?: BasisVersion;

    @HasMany(() => UebFzt, {
        foreignKey: 'BASIS_VERSION',
        sourceKey: 'BASIS_VERSION',
        constraints: false
    })
    uebFzts?: UebFzt[];
}
