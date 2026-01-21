import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { BasisVersion } from "./BasisVersion";
import { MengeBereich } from "./MengeBereich";
import { RecSel } from "./RecSel";

@Table({
    tableName: 'SEL_FZT_FELD',
    timestamps: false
})
export class RecSelFztFeld extends Model {
    @PrimaryKey
    @ForeignKey(() => BasisVersion)
    @Column({
        type: DataType.INTEGER,
        defaultValue: 1
    })
    BASIS_VERSION!: number;

    @PrimaryKey
    @ForeignKey(() => MengeBereich)
    @Column(DataType.INTEGER)
    BEREICH_NR!: number;

    @PrimaryKey
    @Column({
        type: DataType.INTEGER,
        defaultValue: 1
    })
    FGR_NR!: number; // Fahrgast Group (default 1)

    @PrimaryKey
    @ForeignKey(() => RecSel)
    @Column(DataType.INTEGER)
    ONR_TYP_NR!: number;

    @PrimaryKey
    @ForeignKey(() => RecSel)
    @Column(DataType.INTEGER)
    ORT_NR!: number;

    @PrimaryKey
    @ForeignKey(() => RecSel)
    @Column(DataType.INTEGER)
    SEL_ZIEL!: number;

    @PrimaryKey
    @ForeignKey(() => RecSel)
    @Column(DataType.INTEGER)
    SEL_ZIEL_TYP!: number;

    @Column(DataType.INTEGER)
    SEL_FZT?: number; // Travel time in seconds

    // Relationships
    @BelongsTo(() => MengeBereich, {
        foreignKey: 'BEREICH_NR',
        targetKey: 'BEREICH_NR', // Simplified, should be composite
        constraints: false
    })
    mengeBereich?: MengeBereich;

    @BelongsTo(() => RecSel, {
        foreignKey: 'ORT_NR', // Simplified, Sequelize has trouble with multi-col FKs this complex without explicit definition
        constraints: false
    })
    recSel?: RecSel;
}
