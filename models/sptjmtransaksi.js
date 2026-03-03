'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SptjmTransaksi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // ? berguna untuk melakukan join antar tabel
      this.belongsTo(models.AlokasiBantuan);
      this.belongsTo(models.User);
    }
  }
  SptjmTransaksi.init({
    AlokasiBantuanId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER,
    nama: DataTypes.STRING,
    no_urut_harian: DataTypes.INTEGER,
    no_surat: DataTypes.STRING,
    no_telp: DataTypes.STRING,
    jmlh_siswa: DataTypes.INTEGER,
    spp: DataTypes.BIGINT,
    bulan: DataTypes.INTEGER,
    total: DataTypes.BIGINT,
    is_ppdb_bersama: DataTypes.BOOLEAN,
    tgl_terima: DataTypes.DATE,
    status_ambil: DataTypes.BOOLEAN,
    tgl_ambil_realisasi: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'SptjmTransaksi',
  });
  return SptjmTransaksi;
};