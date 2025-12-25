const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const ExcelJS = require("exceljs");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ...existing routes (health, products CRUD) ...

app.post("/bill/download", async (req, res) => {
  try {
    const { items, meta = {} } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: "Items required" });
    }

    let grandTotal = 0;
    const billItems = [];

    for (const i of items) {
      // If client provided full details, use them directly
      if (i.description !== undefined || i.price !== undefined || i.unit !== undefined) {
        const price = Number(i.price || 0);
        const qty = Number(i.qty ?? i.quantity) || 0;
        const total = qty * price;
        billItems.push({
          itemCode: i.itemCode || i.id || "",
          description: i.description || "",
          unit: i.unit || "",
          price,
          quantity: qty,
          total,
        });
        grandTotal += total;
        continue;
      }

      // Fallback: lookup in Firestore by document id or by itemCode field
      const lookupKey = i.itemCode || i.id;
      let snap = null;
      if (lookupKey) {
        snap = await db.collection("products").doc(lookupKey).get();
        if (!snap.exists) {
          const q = await db.collection("products").where("itemCode", "==", lookupKey).limit(1).get();
          if (!q.empty) snap = q.docs[0];
        }
      }

      if (!snap || !snap.exists) {
        console.log("Product not found for item:", i);
        continue;
      }

      const p = snap.data();
      const price = Number(p.price) || 0;
      const qty = Number(i.qty ?? i.quantity) || 0;
      const total = qty * price;
      billItems.push({
        itemCode: p.itemCode || snap.id,
        description: p.description || "",
        unit: p.unit || "",
        price,
        quantity: qty,
        total,
      });
      grandTotal += total;
    }

    if (billItems.length === 0) {
      return res.status(400).json({ error: "No valid items found for bill" });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Construction Cart";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Bill");

    // Header / metadata rows
    const shopName = meta.shopName || "Construction Cart";
    const invoiceNo = meta.invoiceNo || "";
    const customer = meta.customer || "";
    const dateStr = meta.date || new Date().toLocaleDateString();

    sheet.mergeCells("A1:G1");
    sheet.getCell("A1").value = shopName;
    sheet.getCell("A1").font = { size: 14, bold: true };
    sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };

    sheet.addRow([]);
    sheet.addRow(["Invoice No:", invoiceNo, "", "Customer:", customer, "", "Date:", dateStr]);
    sheet.addRow([]);

    // Columns
    sheet.columns = [
      { header: "S.No", key: "sno", width: 6 },
      { header: "Item Code", key: "itemCode", width: 18 },
      { header: "Description", key: "description", width: 40 },
      { header: "Unit", key: "unit", width: 10 },
      { header: "Price", key: "price", width: 12 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Total", key: "total", width: 14 },
    ];

    // Add item rows
    billItems.forEach((it, idx) => {
      sheet.addRow({
        sno: idx + 1,
        itemCode: it.itemCode,
        description: it.description,
        unit: it.unit,
        price: it.price,
        quantity: it.quantity,
        total: it.total,
      });
    });

    sheet.addRow([]);
    const totalRow = sheet.addRow({ description: "GRAND TOTAL", total: grandTotal });
    totalRow.getCell(7).font = { bold: true };
    totalRow.getCell(7).numFmt = '"₹"#,##0.00';

    // Format numeric columns
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber < 5) return;
      const priceCell = row.getCell(5);
      const totalCell = row.getCell(7);
      if (priceCell && typeof priceCell.value === "number") priceCell.numFmt = '"₹"#,##0.00';
      if (totalCell && typeof totalCell.value === "number") totalCell.numFmt = '"₹"#,##0.00';
    });

    // Header styling
    const headerRowIndex = sheet._rows.findIndex(r => r && r.values && r.values.includes("S.No"));
    if (headerRowIndex > 0) {
      const headerRow = sheet.getRow(headerRowIndex);
      headerRow.eachCell(cell => {
        cell.font = { bold: true };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        };
      });
    }

    // Write workbook to buffer and send as attachment
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = invoiceNo ? `bill_${invoiceNo}.xlsx` : "bill.xlsx";
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("Bill download error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

// ...existing export...
exports.api = onRequest({ maxInstances: 10 }, app);
