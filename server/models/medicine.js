const medicines = [
    {
        id: "MED-001",
        hospitalId: "HOSP-TEST-001",
        name: "Paracetamol 500mg",
        genericName: "Paracetamol",
        category: "Tablet",
        manufacturer: "GJ Pharma",
        batchNumber: "PCM-2026-01",
        expiryDate: "2027-06-30",
        purchasePrice: 2.5,
        sellingPrice: 5,
        stock: 150,
        minimumStock: 20,
        supplier: "GJ Medical Suppliers",
        location: "Rack A1",
        status: "active",
        createdAt: new Date().toISOString()
    },
    {
        id: "MED-002",
        hospitalId: "HOSP-TEST-001",
        name: "Amoxicillin 500mg",
        genericName: "Amoxicillin",
        category: "Capsule",
        manufacturer: "GJ Pharma",
        batchNumber: "AMX-2026-02",
        expiryDate: "2027-04-30",
        purchasePrice: 4,
        sellingPrice: 8,
        stock: 80,
        minimumStock: 20,
        supplier: "GJ Medical Suppliers",
        location: "Rack A2",
        status: "active",
        createdAt: new Date().toISOString()
    },
    {
        id: "MED-003",
        hospitalId: "HOSP-TEST-001",
        name: "Azithromycin 500mg",
        genericName: "Azithromycin",
        category: "Tablet",
        manufacturer: "GJ Pharma",
        batchNumber: "AZM-2026-03",
        expiryDate: "2027-02-28",
        purchasePrice: 12,
        sellingPrice: 20,
        stock: 18,
        minimumStock: 25,
        supplier: "HealthCare Suppliers",
        location: "Rack B1",
        status: "active",
        createdAt: new Date().toISOString()
    }
];

const stockTransactions = [];
const sales = [];

// ===============================
// MEDICINES
// ===============================

function getMedicines(hospitalId) {
    return medicines.filter(
        medicine => medicine.hospitalId === hospitalId
    );
}

function getMedicineById(id, hospitalId = null) {
    const medicine = medicines.find(
        medicine => medicine.id === id
    );

    if (!medicine) {
        return null;
    }

    if (
        hospitalId &&
        medicine.hospitalId !== hospitalId
    ) {
        return null;
    }

    return medicine;
}

// ===============================
// CREATE MEDICINE
// ===============================

function createMedicine(data) {

    const medicine = {
        id: `MED-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        hospitalId: data.hospitalId,
        name: data.name,
        genericName: data.genericName || "",
        category: data.category || "Other",
        manufacturer: data.manufacturer || "",
        batchNumber: data.batchNumber || "",
        expiryDate: data.expiryDate || "",
        purchasePrice: Number(data.purchasePrice) || 0,
        sellingPrice: Number(data.sellingPrice) || 0,
        stock: Number(data.stock) || 0,
        minimumStock: Number(data.minimumStock) || 10,
        supplier: data.supplier || "",
        location: data.location || "",
        status: data.status || "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    medicines.push(medicine);

    if (medicine.stock > 0) {

        stockTransactions.push({
            id: `STK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            hospitalId: medicine.hospitalId,
            medicineId: medicine.id,
            medicineName: medicine.name,
            type: "stock_in",
            quantity: medicine.stock,
            previousStock: 0,
            newStock: medicine.stock,
            reason: "Initial Stock",
            reference: "Medicine Creation",
            performedBy: "System",
            source: "initial_stock",
            createdAt: new Date().toISOString()
        });
    }

    return medicine;
}

// ===============================
// UPDATE MEDICINE
// ===============================

function updateMedicine(
    id,
    updates,
    hospitalId = null
) {

    const medicine = getMedicineById(
        id,
        hospitalId
    );

    if (!medicine) {
        return null;
    }

    const allowedFields = [
        "name",
        "genericName",
        "category",
        "manufacturer",
        "batchNumber",
        "expiryDate",
        "purchasePrice",
        "sellingPrice",
        "minimumStock",
        "supplier",
        "location",
        "status"
    ];

    allowedFields.forEach(field => {

        if (updates[field] === undefined) {
            return;
        }

        if (
            field === "purchasePrice" ||
            field === "sellingPrice" ||
            field === "minimumStock"
        ) {
            medicine[field] =
                Number(updates[field]) || 0;
        } else {
            medicine[field] =
                updates[field];
        }
    });

    /*
     * Stock ko update karne ki permission bhi rakhi gayi hai
     * taaki admin/pharmacy direct stock correction kar sake.
     */
    if (updates.stock !== undefined) {

        const newStock =
            Number(updates.stock);

        if (
            Number.isFinite(newStock) &&
            newStock >= 0
        ) {

            const previousStock =
                Number(medicine.stock || 0);

            medicine.stock = newStock;

            if (
                previousStock !== newStock
            ) {

                stockTransactions.push({
                    id: `STK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    hospitalId: medicine.hospitalId,
                    medicineId: medicine.id,
                    medicineName: medicine.name,
                    type:
                        newStock > previousStock
                            ? "stock_in"
                            : "stock_out",
                    quantity:
                        Math.abs(
                            newStock -
                            previousStock
                        ),
                    previousStock,
                    newStock,
                    reason:
                        updates.stockReason ||
                        "Stock Adjustment",
                    reference:
                        updates.reference ||
                        "",
                    performedBy:
                        updates.performedBy ||
                        "Pharmacy",
                    source:
                        "adjustment",
                    createdAt:
                        new Date().toISOString()
                });
            }
        }
    }

    medicine.updatedAt =
        new Date().toISOString();

    return medicine;
}

// ===============================
// STOCK IN
// ===============================

function stockIn(
    id,
    quantity,
    options = {}
) {

    const medicine =
        getMedicineById(
            id,
            options.hospitalId || null
        );

    if (!medicine) {
        return null;
    }

    const qty =
        Number(quantity);

    if (!qty || qty <= 0) {
        return null;
    }

    const previousStock =
        Number(medicine.stock || 0);

    medicine.stock += qty;

    medicine.updatedAt =
        new Date().toISOString();

    stockTransactions.push({
        id: `STK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        hospitalId: medicine.hospitalId,
        medicineId: medicine.id,
        medicineName: medicine.name,
        type: "stock_in",
        quantity: qty,
        previousStock,
        newStock: medicine.stock,
        reason:
            options.reason ||
            "Stock In",
        reference:
            options.reference ||
            "",
        performedBy:
            options.performedBy ||
            "Pharmacy",
        source: "manual",
        createdAt:
            new Date().toISOString()
    });

    return medicine;
}

// ===============================
// STOCK OUT
// ===============================

function stockOut(
    id,
    quantity,
    options = {}
) {

    const medicine =
        getMedicineById(
            id,
            options.hospitalId || null
        );

    if (!medicine) {
        return null;
    }

    const qty =
        Number(quantity);

    if (!qty || qty <= 0) {
        return null;
    }

    if (
        Number(medicine.stock || 0) <
        qty
    ) {
        throw new Error(
            "Insufficient medicine stock"
        );
    }

    const previousStock =
        Number(medicine.stock || 0);

    medicine.stock -= qty;

    medicine.updatedAt =
        new Date().toISOString();

    stockTransactions.push({
        id: `STK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        hospitalId: medicine.hospitalId,
        medicineId: medicine.id,
        medicineName: medicine.name,
        type: "stock_out",
        quantity: qty,
        previousStock,
        newStock: medicine.stock,
        reason:
            options.reason ||
            "Stock Out",
        reference:
            options.reference ||
            "",
        performedBy:
            options.performedBy ||
            "Pharmacy",
        source: "manual",
        createdAt:
            new Date().toISOString()
    });

    return medicine;
}

// ===============================
// LOW STOCK
// ===============================

function getLowStockMedicines(
    hospitalId
) {

    return getMedicines(
        hospitalId
    ).filter(medicine => {

        const stock =
            Number(
                medicine.stock ?? 0
            );

        const minimumStock =
            Number(
                medicine.minimumStock ?? 0
            );

        return (
            stock <=
            minimumStock
        );
    });
}

// ===============================
// EXPIRING MEDICINES
// ===============================

function getExpiringMedicines(
    hospitalId,
    days = 90
) {

    const hospitalMedicines =
        getMedicines(
            hospitalId
        );

    const today =
        new Date();

    const futureDate =
        new Date();

    futureDate.setDate(
        today.getDate() +
        Number(days)
    );

    return hospitalMedicines.filter(
        medicine => {

            if (
                !medicine.expiryDate
            ) {
                return false;
            }

            const expiry =
                new Date(
                    medicine.expiryDate
                );

            return (
                expiry >= today &&
                expiry <= futureDate
            );
        }
    );
}

// ===============================
// EXPIRED MEDICINES
// ===============================

function getExpiredMedicines(
    hospitalId
) {

    const hospitalMedicines =
        getMedicines(
            hospitalId
        );

    const today =
        new Date();

    return hospitalMedicines.filter(
        medicine => {

            if (
                !medicine.expiryDate
            ) {
                return false;
            }

            const expiry =
                new Date(
                    medicine.expiryDate
                );

            return expiry < today;
        }
    );
}

// ===============================
// SEARCH MEDICINES
// ===============================

function searchMedicines(
    hospitalId,
    query
) {

    const medicinesList =
        getMedicines(
            hospitalId
        );

    const search =
        String(
            query || ""
        )
            .trim()
            .toLowerCase();

    if (!search) {
        return medicinesList;
    }

    return medicinesList.filter(
        medicine => {

            return [
                medicine.name,
                medicine.genericName,
                medicine.category,
                medicine.manufacturer,
                medicine.batchNumber,
                medicine.supplier
            ]
                .filter(Boolean)
                .some(value =>
                    String(value)
                        .toLowerCase()
                        .includes(search)
                );
        }
    );
}

// ===============================
// PHARMACY SUMMARY
// ===============================

function getPharmacySummary(
    hospitalId
) {

    const hospitalMedicines =
        getMedicines(
            hospitalId
        );

    const hospitalSales =
        getSales(
            hospitalId
        );

    const lowStock =
        getLowStockMedicines(
            hospitalId
        );

    const expiring =
        getExpiringMedicines(
            hospitalId,
            90
        );

    const expired =
        getExpiredMedicines(
            hospitalId
        );

    const today =
        new Date();

    const salesToday =
        hospitalSales.filter(
            sale => {

                const saleDate =
                    new Date(
                        sale.createdAt
                    );

                return (
                    saleDate.getFullYear() ===
                        today.getFullYear() &&
                    saleDate.getMonth() ===
                        today.getMonth() &&
                    saleDate.getDate() ===
                        today.getDate()
                );
            }
        );

    const totalStockUnits =
        hospitalMedicines.reduce(
            (total, medicine) =>
                total +
                Number(
                    medicine.stock || 0
                ),
            0
        );

    const inventoryValue =
        hospitalMedicines.reduce(
            (total, medicine) =>
                total +
                (
                    Number(
                        medicine.purchasePrice ||
                        0
                    ) *
                    Number(
                        medicine.stock ||
                        0
                    )
                ),
            0
        );

    const todaySalesAmount =
        salesToday.reduce(
            (total, sale) =>
                total +
                Number(
                    sale.total || 0
                ),
            0
        );

    return {
        totalMedicines:
            hospitalMedicines.length,

        totalStockUnits,

        inventoryValue:

            Number(
                inventoryValue.toFixed(2)
            ),

        lowStockCount:
            lowStock.length,

        expiringCount:
            expiring.length,

        expiredCount:
            expired.length,

        salesTodayCount:
            salesToday.length,

        todaySalesAmount:

            Number(
                todaySalesAmount.toFixed(2)
            )
    };
}

// ===============================
// CREATE SALE / DISPENSE
// ===============================

function createSale(data) {

    const medicine =
        getMedicineById(
            data.medicineId,
            data.hospitalId || null
        );

    if (!medicine) {
        throw new Error(
            "Medicine not found"
        );
    }

    const quantity =
        Number(data.quantity);

    if (
        !quantity ||
        quantity <= 0
    ) {
        throw new Error(
            "Invalid quantity"
        );
    }

    if (
        Number(medicine.stock || 0) <
        quantity
    ) {
        throw new Error(
            "Insufficient medicine stock"
        );
    }

    const previousStock =
        Number(
            medicine.stock || 0
        );

    medicine.stock -=
        quantity;

    medicine.updatedAt =
        new Date().toISOString();

    const price =
        Number(data.price) ||
        Number(
            medicine.sellingPrice || 0
        );

    const sale = {

        id:
            `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,

        hospitalId:
            medicine.hospitalId,

        patientId:
            data.patientId || "",

        patientName:
            data.patientName || "",

        medicineId:
            medicine.id,

        medicineName:
            medicine.name,

        quantity,

        price,

        total:
            quantity * price,

        prescriptionRef:
            data.prescriptionRef || "",

        performedBy:
            data.performedBy ||
            "Pharmacy",

        createdAt:
            new Date().toISOString()
    };

    sales.push(
        sale
    );

    stockTransactions.push({

        id:
            `STK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,

        hospitalId:
            medicine.hospitalId,

        medicineId:
            medicine.id,

        medicineName:
            medicine.name,

        type:
            "dispense",

        quantity,

        previousStock,

        newStock:
            medicine.stock,

        reason:
            "Medicine Dispensed",

        reference:
            data.prescriptionRef ||
            sale.id,

        performedBy:
            data.performedBy ||
            "Pharmacy",

        source:
            "dispense",

        saleId:
            sale.id,

        createdAt:
            new Date().toISOString()
    });

    return sale;
}

// ===============================
// SALES
// ===============================

function getSales(
    hospitalId
) {

    return sales
        .filter(
            sale =>
                sale.hospitalId ===
                hospitalId
        )
        .sort(
            (a, b) =>
                new Date(
                    b.createdAt
                ) -
                new Date(
                    a.createdAt
                )
        );
}

// ===============================
// STOCK TRANSACTIONS
// ===============================

function getStockTransactions(
    hospitalId
) {

    return stockTransactions
        .filter(
            transaction =>
                transaction.hospitalId ===
                hospitalId
        )
        .sort(
            (a, b) =>
                new Date(
                    b.createdAt
                ) -
                new Date(
                    a.createdAt
                )
        );
}

// ===============================
// EXPORTS
// ===============================

module.exports = {

    getMedicines,

    getMedicineById,

    createMedicine,

    updateMedicine,

    stockIn,

    stockOut,

    getLowStockMedicines,

    getExpiringMedicines,

    getExpiredMedicines,

    searchMedicines,

    getPharmacySummary,

    createSale,

    getSales,

    getStockTransactions
};