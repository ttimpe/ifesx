import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { BasisVersion } from './BasisVersion';

@Table({
    tableName: 'REC_EINZELDIENST',
    timestamps: false
})
export class RecEinzeldienst extends Model {
    // P1
    @PrimaryKey
    @ForeignKey(() => BasisVersion)
    @Column(DataType.INTEGER)
    BASIS_VERSION!: number;

    // P2
    @PrimaryKey
    @Column(DataType.STRING(5))
    EDB_VERSION!: string;

    // P3
    @PrimaryKey
    @Column(DataType.INTEGER)
    TAGESART_AUSWAHL!: number;

    // P4
    @PrimaryKey
    @Column(DataType.INTEGER)
    ED_NR!: number;

    // Attributes
    @Column(DataType.INTEGER)
    ANF_ORT?: number;

    @Column(DataType.INTEGER)
    ANF_ORT_TYP?: number;

    @Column(DataType.INTEGER)
    BETRIEBSHOF_AUSWAHL?: number;

    @Column(DataType.INTEGER)
    DIENSTART_NR?: number; // DIENSTSTART_NR in screenshot? No, likely DIENSTART. Screenshot says DIENSTSTART_NR (Start Type?)

    @Column(DataType.INTEGER)
    DIENSTSTART_NR?: number; // Added based on screenshot name

    @Column(DataType.INTEGER)
    DIENST_GUELTIG_AB?: number;

    @Column(DataType.INTEGER)
    ED_ANF_ZEIT?: number;

    @Column(DataType.INTEGER)
    ED_ANR_WZ?: number;

    @Column(DataType.INTEGER)
    ED_DAUER?: number;

    @Column(DataType.INTEGER)
    ED_END_ZEIT?: number;

    @Column(DataType.INTEGER)
    ED_FUELL?: number;

    @Column(DataType.INTEGER)
    ED_FUELLR?: number;

    @Column(DataType.INTEGER)
    ED_FUELLZ?: number;

    @Column(DataType.STRING(5))
    ED_KUERZEL?: string;

    @Column(DataType.INTEGER)
    ED_LENK?: number;

    @Column(DataType.INTEGER)
    ED_NACHB?: number;

    @Column(DataType.INTEGER)
    ED_PAUSE?: number;

    @Column(DataType.INTEGER)
    ED_SCHICHT?: number;

    @Column(DataType.INTEGER)
    ED_SUM_WZ?: number;

    @Column(DataType.INTEGER)
    ED_UMLAUF?: number;

    @Column(DataType.INTEGER)
    ED_VORB?: number;

    @Column(DataType.INTEGER)
    ED_WEG?: number;

    @Column(DataType.INTEGER)
    ED_WEG_P?: number;

    @Column(DataType.FLOAT)
    ED_WZ_FAKT?: number;

    @Column(DataType.INTEGER)
    ED_ZUS_NACHB?: number;

    @Column(DataType.INTEGER)
    ED_ZUS_VORB?: number;

    @Column(DataType.INTEGER)
    END_ORT?: number;

    @Column(DataType.INTEGER)
    END_ORT_TYP?: number;

    @Column(DataType.STRING(5))
    FPL_KUERZEL?: string;

    @Column(DataType.INTEGER)
    LINIE_AUSWAHL?: number;

    @Column(DataType.INTEGER)
    PD_NR?: number;

    // Relations
    @BelongsTo(() => BasisVersion)
    basisVersion?: BasisVersion;
}
