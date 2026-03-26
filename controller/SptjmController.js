const { User, SptjmTransaksi, AlokasiBantuan, MasterSekolah} = require("../models");
const { Op } = require("sequelize"); // Dibutuhkan untuk filter range tanggal
const ExcelJS = require('exceljs'); // Baris ini yang hilang!

class SptjmController {
  // ? Create New Transaction
  static async createTransaction(req, res) {
    try {
      const {
        nama,
        AlokasiBantuanId,
        no_surat,
        no_telp,
        jmlh_siswa,
        spp,
        bulan,
        is_ppdb_bersama,
        tgl_terima
      } = req.body;

      // 1. Logika Auto-Calculate Total
      const total = BigInt(jmlh_siswa) * BigInt(spp) * BigInt(bulan);

      // 2. Logika Reset No Urut Harian
      // Kita cari transaksi yang dibuat pada tanggal tgl_terima yang sama
      const startOfDay = new Date(tgl_terima);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(tgl_terima);
      endOfDay.setHours(23, 59, 59, 999);

      const countToday = await SptjmTransaksi.count({
        where: {
          tgl_terima: {
            [Op.between]: [startOfDay, endOfDay]
          }
        }
      });

      const no_urut_harian = countToday + 1;

      // 3. Simpan ke Database
      const newSptjm = await SptjmTransaksi.create({
        AlokasiBantuanId,
        nama,
        UserId: res.dataUser.id, // Diambil dari middleware authentication
        no_urut_harian,
        no_surat,
        no_telp,
        jmlh_siswa,
        spp,
        bulan,
        total,
        is_ppdb_bersama,
        tgl_terima,
        status_ambil: false
      });

      return res.status(201).json({
        status: 'success',
        message: 'Transaksi SPTJM berhasil disimpan',
        data: newSptjm
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: 'error', error });
    }
  }

  // ? search school by npsn
  static async searchSchoolByNpsn(req, res){
    try {
      const { npsn } = req.params;
      const schools = await MasterSekolah.findAll({
        where: { npsn },
        include: [{
          model: AlokasiBantuan
        }]
      })
      if (schools.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Data NPSN tidak ditemukan di Master Sekolah'
        });
      }
      return res.status(200).json({
        status: 'success',
        data: schools
      })
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        error
      })
    }
  }

  static async getLastTransaction(req, res){
    try {
      const { masterSekolahId } = req.params;
      
      const lastTx = await SptjmTransaksi.findOne({
        include: [{
          model: AlokasiBantuan,
          where: { MasterSekolahId: masterSekolahId }
        }],
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        status: 'success',
        data: lastTx
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        error
      })
    }
  }

  // ? DASHBOARD
  // ? 1. List semua transaksi dengan filter tanggal (Dashboard)
  static async getAllTransactions(req, res) {
    try {
      const { date, q } = req.query; // q untuk search nama sekolah
      let whereClause = {};
      let schoolWhere = {};

      // Filter berdasarkan tanggal
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        whereClause.tgl_terima = { [Op.between]: [startOfDay, endOfDay] };
      }

      // Filter berdasarkan nama sekolah (Pencarian Parsial)
      if (q) {
        schoolWhere.nama_sekolah = { [Op.iLike]: `%${q}%` };
      }



      const transactions = await SptjmTransaksi.findAll({
        where: whereClause,
        include: [
          {
            model: AlokasiBantuan,
            required: true, // Gunakan required true agar filter schoolWhere berfungsi sebagai INNER JOIN
            include: [
              {
                model: MasterSekolah,
                where: schoolWhere,
              },
            ],
          },
          { model: User, attributes: ["username"] },
        ],
        order: [["no_urut_harian", "ASC"]],
      });

      return res.status(200).json({ status: "success", data: transactions });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: "error", error: error.message });
    }
  }
// !NEW
// static async renderDashboard2(req, res) {
//   try {
//     const { date, q, npsn } = req.query; // Tambahkan npsn di sini
//     let whereClause = {};
//     let schoolWhere = {};

//     // 1. Logika Filter Tanggal
//     if (date) {
//       const startOfDay = new Date(date);
//       startOfDay.setHours(0, 0, 0, 0);
//       const endOfDay = new Date(date);
//       endOfDay.setHours(23, 59, 59, 999);
//       whereClause.tgl_terima = { [Op.between]: [startOfDay, endOfDay] };
//     }

//     // 2. Logika Filter Nama Sekolah
//     if (q) {
//       schoolWhere.nama_sekolah = { [Op.iLike]: `%${q}%` };
//     }

//     // 3. Logika Filter NPSN (Baru)
//     if (npsn) {
//       schoolWhere.npsn = { [Op.iLike]: `%${npsn}%` };
//     }

//     const transactions = await SptjmTransaksi.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: AlokasiBantuan,
//           required: true, 
//           include: [{ model: MasterSekolah, where: schoolWhere }],
//         },
//         { model: User, attributes: ["username"] },
//       ],
//       order: [["no_urut_harian", "DESC"]],
//     });

//     res.render("dashboard2", { 
//       data: transactions, 
//       user: req.dataUser,
//       currentDate: date || '',
//       currentSearch: q || '',
//       currentNpsn: npsn || '' // Kirim balik ke view agar input tidak kosong
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).render("error", { message: error.message });
//   }
// }

// ! MORE NEW LAGI 
static async renderDashboard2(req, res) {
  try {
    const { date, q, npsn } = req.query; 
    
    // Cek apakah ada minimal satu filter yang digunakan
    const isFiltered = !!(date || q || npsn);

    let transactions = [];

    if (isFiltered) {
      let whereClause = {};
      let schoolWhere = {};

      // 1. Perbaikan Filter Tanggal (WIB +7)
      if (date) {
        // Memaksa awal dan akhir hari ke zona waktu Jakarta
        const startOfDay = new Date(`${date}T00:00:00.000+07:00`);
        const endOfDay = new Date(`${date}T23:59:59.999+07:00`);
        
        whereClause.tgl_terima = { [Op.between]: [startOfDay, endOfDay] };
      }

      // 2. Perbaikan Filter Pencarian
      if (q) schoolWhere.nama_sekolah = { [Op.iLike]: `%${q}%` };
      
      // NPSN sebaiknya menggunakan Op.eq (sama dengan) agar lebih presisi dan cepat
      if (npsn) schoolWhere.npsn = { [Op.eq]: npsn }; 

      // 3. Query dengan Logika Relasi yang Lebih Aman
      transactions = await SptjmTransaksi.findAll({
        where: whereClause,
        include: [
          {
            model: AlokasiBantuan,
            // Jika sedang mencari sekolah (q/npsn), gunakan INNER JOIN (true)
            // Jika hanya filter tanggal, gunakan LEFT JOIN (false) agar transaksi tetap muncul
            required: (q || npsn) ? true : false, 
            include: [{ 
              model: MasterSekolah, 
              where: schoolWhere,
              required: (q || npsn) ? true : false
            }],
          },
          { model: User, attributes: ["username"] },
        ],
        // Mengurutkan berdasarkan nomor urut harian terbaru
        order: [
          ["no_urut_harian", "DESC"]
        ],
      });
    }

    res.render("dashboard2", { 
      data: transactions, 
      user: req.dataUser,
      currentDate: date || '',
      currentSearch: q || '',
      currentNpsn: npsn || '',
      isFiltered: isFiltered 
    });

  } catch (error) {
    console.error("Error Dashboard2:", error);
    res.status(500).render("error", { message: error.message });
  }
}

// ! Existing
// static async renderDashboard2(req, res) {
//   try {
//     const { date, q } = req.query; 
//     let whereClause = {};
//     let schoolWhere = {};

//     // Kita gunakan LOGIKA YANG SAMA dengan getAllTransactions kamu
//     if (date) {
//       const startOfDay = new Date(date);
//       startOfDay.setHours(0, 0, 0, 0);
//       const endOfDay = new Date(date);
//       endOfDay.setHours(23, 59, 59, 999);
//       whereClause.tgl_terima = { [Op.between]: [startOfDay, endOfDay] };
//     }

//     if (q) {
//       schoolWhere.nama_sekolah = { [Op.iLike]: `%${q}%` };
//     }

//     const transactions = await SptjmTransaksi.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: AlokasiBantuan,
//           required: true, 
//           include: [{ model: MasterSekolah, where: schoolWhere }],
//         },
//         { model: User, attributes: ["username"] },
//       ],
//       order: [["no_urut_harian", "DESC"]],
//     });

//     // KIRIM KE EJS (Bukan JSON)
//     res.render("dashboard2", { 
//       data: transactions, 
//       user: req.dataUser, // Data dari middleware authentication
//       // currentDate: date || new Date().toISOString().split('T')[0]
//       currentDate: req.query.date || '', // Kirim balik tanggal agar input tetap terisi
//       currentSearch: req.query.q || ''   // Kirim balik kata kunci pencarian
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).render("error", { message: error.message });
//   }
// }

// ! NEW
static async renderDashboard(req, res) {
  try {
    // 1. Ambil tanggal hari ini dalam format YYYY-MM-DD (WIB)
    const now = new Date();
    const today = new Date(now.getTime() + (7 * 60 * 60 * 1000)).toISOString().split('T')[0];

    // 2. Ambil parameter dari query
    const startDate = req.query.startDate || today;
    const endDate = req.query.endDate || today;
    const q = req.query.q || '';
    const npsn = req.query.npsn || ''; // Tambahan filter NPSN jika diperlukan

    let whereClause = {};
    let schoolWhere = {};

    // 3. Logika Filter Range Tanggal dengan koreksi Offset WIB (+7)
    // Kita buat string ISO manual agar Sequelize mengirimkan timestamp yang tepat ke DB
    const start = new Date(`${startDate}T00:00:00.000+07:00`);
    const end = new Date(`${endDate}T23:59:59.999+07:00`);

    whereClause.tgl_terima = { [Op.between]: [start, end] };

    // 4. Logika Filter Pencarian
    if (q) {
      schoolWhere.nama_sekolah = { [Op.iLike]: `%${q}%` };
    }
    
    if (npsn) {
      schoolWhere.npsn = { [Op.eq]: npsn }; // NPSN biasanya eksak (lebih cepat)
    }

    // 5. Query ke Database
    const transactions = await SptjmTransaksi.findAll({
      where: whereClause,
      include: [
        {
          model: AlokasiBantuan,
          // Ubah required ke false jika ingin melihat transaksi yang sekolahnya belum terdaftar
          // Ubah ke true jika hanya ingin melihat transaksi yang data sekolahnya lengkap
          required: (q || npsn) ? true : false, 
          include: [
            { 
              model: MasterSekolah, 
              where: schoolWhere 
            }
          ],
        },
        { 
          model: User, 
          attributes: ["username"] 
        }
      ],
      // Mengurutkan berdasarkan nomor urut harian terbaru
      order: [
        ["no_urut_harian", "DESC"]
      ], 
    });

    // 6. Render ke EJS
    res.render("dashboard", { 
      data: transactions, 
      user: req.dataUser,
      startDate: startDate, 
      endDate: endDate,     
      currentSearch: q,
      currentNpsn: npsn
    });

  } catch (error) {
    console.error("Error Dashboard:", error);
    res.status(500).render("error", { message: error.message });
  }
}

// ! existing nih
// static async renderDashboard(req, res) {
//   try {
//     // 1. Ambil tanggal dari query, jika kosong gunakan tanggal hari ini (WIB)
//     const today = new Date().toISOString().split('T')[0]; 
//     const dateFilter = req.query.date || today; 
//     const q = req.query.q || '';

//     let whereClause = {};
//     let schoolWhere = {};

//     // 2. Logika filter tanggal (Otomatis memfilter dateFilter)
//     const startOfDay = new Date(dateFilter);
//     startOfDay.setHours(0, 0, 0, 0);
//     const endOfDay = new Date(dateFilter);
//     endOfDay.setHours(23, 59, 59, 999);
//     whereClause.tgl_terima = { [Op.between]: [startOfDay, endOfDay] };

//     if (q) {
//       schoolWhere.nama_sekolah = { [Op.iLike]: `%${q}%` };
//     }

//     const transactions = await SptjmTransaksi.findAll({
//       where: whereClause,
//       include: [{
//           model: AlokasiBantuan,
//           required: true,
//           include: [{ model: MasterSekolah, where: schoolWhere }],
//       },{ model: User, attributes: ["username"] }],
//       order: [["no_urut_harian", "DESC"]],
//     });

//     // 3. Kirim dateFilter ke EJS agar kotak input terisi otomatis
//     res.render("dashboard", { 
//       data: transactions, 
//       user: req.dataUser,
//       currentDate: dateFilter, // Akan berisi tanggal hari ini secara default
//       currentSearch: q
//     });

//   } catch (error) {
//     res.status(500).render("error", { message: error.message });
//   }
// }
// ? 2. Tracking Transaksi berdasarkan NPSN (Melihat Riwayat Sekolah)
  static async trackByNpsn(req, res) {
    try {
      const { npsn } = req.params;

      const history = await SptjmTransaksi.findAll({
        include: [
          {
            model: AlokasiBantuan,
            required: true,
            include: [
              {
                model: MasterSekolah,
                where: { npsn },
              },
            ],
          },
          { model: User, attributes: ["username"] },
        ],
        order: [["tgl_terima", "DESC"]], // Dokumen terbaru muncul paling atas
      });

      if (history.length === 0) {
        return res.status(404).json({
          status: "error",
          message: `Tidak ada riwayat untuk NPSN: ${npsn}`,
        });
      }

      return res.status(200).json({ status: "success", data: history });
    } catch (error) {
      return res.status(500).json({ status: "error", error: error.message });
    }
  }

  // ? 2. Update status pengambilan (Fitur Klik Selesai)
  // static async updatePickupStatus(req, res) {
  //   try {

  //     const { id } = req.params;
  //     const { tgl_ambil_realisasi } = req.body;

  //     const transaction = await SptjmTransaksi.findByPk(id);

  //     if (!transaction) {
  //       return res.status(404).json({ status: 'error', message: 'Data tidak ditemukan' });
  //     }

  //     await transaction.update({
  //       status_ambil: true,
  //       tgl_ambil_realisasi: tgl_ambil_realisasi || new Date() // Jika tgl tidak diisi, otomatis pakai hari ini
  //     });

  //     return res.status(200).json({
  //       status: 'success',
  //       message: 'Status pengambilan berhasil diperbarui',
  //       data: transaction
  //     });
  //   } catch (error) {
  //     return res.status(500).json({ status: 'error', error });
  //   }
  // }
// Di dalam SptjmController.js
  static async updatePickupStatus(req, res) {
    try {
      const { id } = req.params;
      const transaction = await SptjmTransaksi.findByPk(id);

      if (!transaction) {
        return res.status(404).json({ status: 'error', message: 'Data tidak ditemukan' });
      }

      // LOGIKA TOGGLE: Jika true jadi false, jika false jadi true
      const newStatus = !transaction.status_ambil;

      await transaction.update({
        status_ambil: newStatus,
        tgl_ambil_realisasi: newStatus ? new Date() : null // Reset tanggal jika di-switch ke false
      });

      return res.status(200).json({
        status: 'success',
        message: `Status berhasil diubah menjadi ${newStatus ? 'Selesai' : 'Diproses'}`,
        data: { status_ambil: newStatus }
      });
    } catch (error) {
      return res.status(500).json({ status: 'error', error: error.message });
    }
  }

  // ? update terbaru
static async updateTransaction(req, res) {
    try {
        const { id } = req.params;
        const { no_surat, nama, jmlh_siswa, spp, bulan, no_telp, is_ppdb_bersama, tgl_terima } = req.body;

        const transaction = await SptjmTransaksi.findByPk(id);
        if (!transaction) {
            return res.status(404).json({ status: 'error', message: 'Data tidak ditemukan' });
        }

        // Hitung ulang total dana
        const newTotal = Number(jmlh_siswa) * Number(spp) * Number(bulan);

        await transaction.update({
            no_surat,
            nama,
            jmlh_siswa,
            spp,
            bulan,
            no_telp,
            total: newTotal,
            is_ppdb_bersama: is_ppdb_bersama === 'true' || is_ppdb_bersama === true,
            tgl_terima
        });

        return res.status(200).json({ status: 'success', message: 'Data berhasil diperbarui' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
}

  // ? 1. Get Transaction By ID (Detail)
static async getTransactionById(req, res) {
  try {
    const { id } = req.params;
    const transaction = await SptjmTransaksi.findByPk(id, {
      include: [
        {
          model: AlokasiBantuan,
          include: [MasterSekolah]
        },
        { model: User, attributes: ['username'] }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Data tidak ditemukan' });
    }

    return res.status(200).json({ status: 'success', data: transaction });
  } catch (error) {
    return res.status(500).json({ status: 'error', error });
  }
}
static async renderEditPage(req, res) {
    try {
        const { id } = req.params;

        // Ambil data transaksi beserta relasi sekolah dan alokasinya
        const data = await SptjmTransaksi.findByPk(id, {
            include: [
                {
                    model: AlokasiBantuan,
                    include: [{ model: MasterSekolah }]
                }
            ]
        });

        if (!data) {
            return res.status(404).send("Data SPTJM tidak ditemukan.");
        }

        // Render halaman edit dengan membawa data yang ditemukan
        res.render("edit-sptjm", {
            data,
            user: req.dataUser, // Data user untuk sidebar/navbar
            currentDate: new Date().toLocaleDateString('en-CA'), // Untuk default input date
            currentPage: 'dashboard'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server.");
    }
}

  // ? 2. Update Transaction (Edit Data)
  static async updateTransaction(req, res) {
    try {
      const { id } = req.params;
      const { no_surat, no_telp, jmlh_siswa, spp, bulan, is_ppdb_bersama, tgl_terima } = req.body;

      
      const transaction = await SptjmTransaksi.findByPk(id);

      if (!transaction) {
        return res.status(404).json({ status: 'error', message: 'Data tidak ditemukan' });
      }
      

      // Hitung ulang total jika ada perubahan pada siswa, spp, atau bulan
      const updatedTotal = BigInt(jmlh_siswa || transaction.jmlh_siswa) * BigInt(spp || transaction.spp) * BigInt(bulan || transaction.bulan);

      // Di bagian akhir updateTransaction
      await transaction.update({
        no_surat,
        no_telp,
        jmlh_siswa,
        spp,
        bulan,
        is_ppdb_bersama,
        tgl_terima,
        total: updatedTotal
      });

      // Ubah ke JSON dulu, lalu paksa 'total' jadi String agar tidak error saat dikirim
      const result = transaction.toJSON();
      result.total = result.total.toString();

      return res.status(200).json({ 
        status: 'success', 
        message: 'Data berhasil diupdate', 
        data: result 
      });
      // await transaction.update({
      //   no_surat,
      //   no_telp,
      //   jmlh_siswa,
      //   spp,
      //   bulan,
      //   is_ppdb_bersama,
      //   tgl_terima,
      //   total: updatedTotal
      // });
      // return res.status(200).json({ status: 'success', message: 'Data berhasil diupdate', data: transaction });
    } catch (error) {
      return res.status(500).json({ status: 'error', error });
    }
  }

  // ? 3. Delete Transaction
  static async deleteTransaction(req, res) {
    try {
      const { id } = req.params;
      const transaction = await SptjmTransaksi.findByPk(id);

      if (!transaction) {
        return res.status(404).json({ status: 'error', message: 'Data tidak ditemukan' });
      }

      await transaction.destroy();
      return res.status(200).json({ status: 'success', message: 'Data transaksi berhasil dihapus' });
    } catch (error) {
      return res.status(500).json({ status: 'error', error });
    }
  }


  // ? export ke excel
  // static async exportToExcel(req, res) {
  //   try {
  //       const { date, q } = req.query;
  //       let whereClause = {};
  //       let schoolWhere = {};

  //       if (date) {
  //           const startOfDay = new Date(date);
  //           startOfDay.setHours(0, 0, 0, 0);
  //           const endOfDay = new Date(date);
  //           endOfDay.setHours(23, 59, 59, 999);
  //           whereClause.tgl_terima = { [Op.between]: [startOfDay, endOfDay] };
  //       }

  //       if (q) {
  //           schoolWhere.nama_sekolah = { [Op.iLike]: `%${q}%` };
  //       }

  //     const data = await SptjmTransaksi.findAll({
  //       where: whereClause,
  //       include: [
  //         {
  //           model: AlokasiBantuan,
  //           // required: true, // Gunakan required true agar filter schoolWhere berfungsi sebagai INNER JOIN
  //           include: [
  //             {
  //               model: MasterSekolah,
  //               where: schoolWhere,
  //             },
  //           ],
  //         },
  //         { model: User, attributes: ["username"] },
  //       ],
  //       order: [["no_urut_harian", "ASC"]],
  //     });

  //       // const data = await SptjmTransaksi.findAll({
  //       //     where: whereClause,
  //       //     include: [{
  //       //         model: AlokasiBantuan,
  //       //         include: [{ model: MasterSekolah, where: schoolWhere }]
  //       //     }, { model: User }],
  //       //     order: [['no_urut_harian', 'ASC']]
  //       // });
  //       // console.log(data);

  //       const workbook = new ExcelJS.Workbook();
  //       const worksheet = workbook.addWorksheet('Rekap SPTJM');

  //       // Header Kolom
  //       worksheet.columns = [
  //           { header: 'No', key: 'no', width: 5 },
  //           { header: 'Tgl Terima', key: 'tgl', width: 15 },
  //           { header: 'Nama Penanggung Jawab', key: 'nama', width: 25 },
  //           { header: 'Nama Sekolah', key: 'sekolah', width: 30 },
  //           { header: 'NPSN', key: 'npsn', width: 15 },
  //           { header: 'No. Surat', key: 'no_surat', width: 25 },
  //           { header: 'Jumlah Penerima Bantuan', key: 'siswa_awal', width: 25 },
  //           { header: 'Jumlah Siswa yang diajukan', key: 'siswa', width: 10 },
  //           { header: 'Total Dana', key: 'total', width: 20 },
  //           { header: 'Petugas', key: 'petugas', width: 15 },
  //           { header: 'Status', key: 'status', width: 12 }
  //       ];

  //       data.forEach((item, index) => {
  //           worksheet.addRow({
  //               no: item.no_urut_harian,
  //               sekolah: item.AlokasiBantuan?.MasterSekolah?.nama_sekolah,
  //               npsn: item.AlokasiBantuan?.MasterSekolah?.npsn,
  //               nama: item.nama,
  //               no_surat: item.no_surat,
  //               tgl: new Date(item.tgl_terima).toLocaleDateString('id-ID'),
  //               siswa_awal: item.AlokasiBantuan?.jumlah_penerima,
  //               siswa: item.jmlh_siswa,
  //               total: parseInt(item.total),
  //               petugas: item.User?.username,
  //               status: item.status_ambil ? 'Selesai' : 'Proses'
  //           });
  //       });

  //       // Styling Header
  //       worksheet.getRow(1).font = { bold: true };
        
  //       res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  //       res.setHeader('Content-Disposition', `attachment; filename=REKAP_SPTJM_${date || 'SEMUA'}.xlsx`);

  //       await workbook.xlsx.write(res);
  //       res.end();

  //   } catch (error) {
  //       res.status(500).json({ status: 'error', message: error.message });
  //   }
  // }
static async exportToExcel(req, res) {
    try {
        // 1. Ambil startDate, endDate, dan q dari query string
        const { startDate, endDate, q } = req.query;
        let whereClause = {};
        let schoolWhere = {};

        // 2. Logika Filter Range Tanggal (Sama dengan Dashboard)
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            whereClause.tgl_terima = { [Op.between]: [start, end] };
        }

        if (q) {
            schoolWhere.nama_sekolah = { [Op.iLike]: `%${q}%` };
        }

        // 3. Ambil Data
        const data = await SptjmTransaksi.findAll({
            where: whereClause,
            include: [
                {
                    model: AlokasiBantuan,
                    required: true, 
                    include: [
                        {
                            model: MasterSekolah,
                            where: schoolWhere,
                        },
                    ],
                },
                { model: User, attributes: ["username"] },
            ],
            order: [["no_urut_harian", "ASC"]],
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Rekap SPTJM');

        // Header Kolom
        worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Tgl Terima', key: 'tgl', width: 15 },
            { header: 'Nama Penanggung Jawab', key: 'nama', width: 25 },
            { header: 'Nama Sekolah', key: 'sekolah', width: 30 },
            { header: 'NPSN', key: 'npsn', width: 15 },
            { header: 'No. Surat', key: 'no_surat', width: 25 },
            { header: 'Jumlah Penerima Bantuan', key: 'siswa_awal', width: 25 },
            { header: 'Jumlah Siswa yang diajukan', key: 'siswa', width: 10 },
            { header: 'tahun', key: 'tahun', width: 5},
            { header: 'tahap', key: 'tahap', width: 2 },
            { header: 'Total Dana', key: 'total', width: 20 },
            { header: 'Petugas', key: 'petugas', width: 15 },
            { header: 'Status', key: 'status', width: 12 }
        ];

        data.forEach((item) => {
            worksheet.addRow({
                no: item.no_urut_harian,
                sekolah: item.AlokasiBantuan?.MasterSekolah?.nama_sekolah,
                npsn: item.AlokasiBantuan?.MasterSekolah?.npsn,
                nama: item.nama,
                no_surat: item.no_surat,
                tgl: new Date(item.tgl_terima).toLocaleDateString('id-ID'),
                siswa_awal: item.AlokasiBantuan?.jumlah_penerima,
                siswa: item.jmlh_siswa,
                tahun: item.AlokasiBantuan?.tahun,
                tahap: item.AlokasiBantuan?.tahap,
                total: item.total ? Number(item.total) : 0, // Gunakan Number() untuk BigInt
                petugas: item.User?.username,
                status: item.status_ambil ? 'Selesai' : 'Proses'
            });
        });

        // Styling Header
        worksheet.getRow(1).font = { bold: true };
        
        // 4. Penyesuaian Nama File agar mencerminkan range tanggal
        const fileName = (startDate && endDate) 
            ? `REKAP_SPTJM_${startDate}_sd_${endDate}.xlsx` 
            : `REKAP_SPTJM_SEMUA.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: error.message });
    }
}

}

module.exports = SptjmController