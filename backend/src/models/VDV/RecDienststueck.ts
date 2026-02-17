import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { BasisVersion } from './BasisVersion';
import { RecUmlauf } from './RecUmlauf';
import { MengeDienststueckart } from './MengeDienststueckart';

@Table({
    tableName: 'REC_DIENSTSTUECK',
    timestamps: false
})
export class RecDienststueck extends Model {
    // P1
    @PrimaryKey
    @ForeignKey(() => BasisVersion)
    @Column(DataType.INTEGER)
    BASIS_VERSION!: number;

    // P2
    @PrimaryKey
    @Column(DataType.INTEGER)
    TAGESART_AUSWAHL!: number;

    // P3
    @PrimaryKey
    @Column(DataType.STRING(5))
    EBD_VERSION!: string;

    // P4
    @PrimaryKey
    @Column(DataType.INTEGER)
    ED_NR!: number;

    // P5
    @PrimaryKey
    @Column(DataType.INTEGER)
    DST_ANF_ZEIT!: number;


    // Attributes from Screenshot 1
    @Column(DataType.INTEGER)
    ANF_ORT?: number;

    @Column(DataType.INTEGER)
    ANF_ORT_TYP?: number;

    @Column(DataType.INTEGER)
    BETRIEBSHOF_AUSWAHL?: number;

    @Column(DataType.INTEGER)
    DIENSTELEMENTNR_SYSTEM?: number;

    @Column(DataType.INTEGER)
    DIENSTSTUECKART_NR?: number;

    @Column(DataType.INTEGER)
    DIENST_GUELTIG_AB?: number;

    @Column(DataType.INTEGER)
    DST_DAUER?: number;

    @Column(DataType.INTEGER)
    DST_END_ZEIT?: number;


    // Attributes from Screenshot 2
    @Column(DataType.INTEGER)
    END_ORT?: number;

    @Column(DataType.INTEGER)
    END_ORT_TYP?: number;

    @Column(DataType.STRING(5))
    FPL_KUERZEL?: string;

    @Column(DataType.STRING(10))
    KOST_TR_NR?: string; // Type unclear in screenshot, assuming string

    @Column(DataType.INTEGER)
    LFD_DIENSTSTUECKNR?: number;

    @Column(DataType.INTEGER)
    LINIE_AUSWAHL?: number;

    // FK to RecUmlauf
    @ForeignKey(() => RecUmlauf)
    @Column(DataType.INTEGER)
    UM_UID?: number;


    // Relations
    @BelongsTo(() => BasisVersion)
    basisVersion?: BasisVersion;

    @BelongsTo(() => RecUmlauf)
    block?: RecUmlauf;
}
