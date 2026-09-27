const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");
const DATA_FILE = path.join(DATA_DIR, "bills.json");

/* =========================================================
   STORAGE
========================================================= */

function ensureStorage() {

    if (!fs.existsSync(DATA_DIR)) {

        fs.mkdirSync(
            DATA_DIR,
            { recursive: true }
        );
    }

    if (!fs.existsSync(DATA_FILE)) {

        fs.writeFileSync(
            DATA_FILE,
            "[]",
            "utf8"
        );
    }
}


/* =========================================================
   READ BILLS
========================================================= */

function readBills() {

    ensureStorage();

    try {

        const data =
            fs.readFileSync(
                DATA_FILE,
                "utf8"
            );

        const bills =
            JSON.parse(
                data || "[]"
            );

        return Array.isArray(bills)
            ? bills
            : [];

    } catch (error) {

        console.error(
            "Bill storage read error:",
            error
        );

        return [];
    }
}


/* =========================================================
   WRITE BILLS
========================================================= */

function writeBills(bills) {

    ensureStorage();

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(
            bills,
            null,
            2
        ),
        "utf8"
    );
}


/* =========================================================
   NORMALIZE ITEMS
   Supports 100+ medicines and multiple medicines in one bill
========================================================= */

function normalizeItems(data) {

    /* New billing system */

    if (
        Array.isArray(data.items) &&
        data.items.length > 0
    ) {

        return data.items.map(item => {

            const quantity =
                Number(
                    item.quantity || 0
                );

            const price =
                Number(
                    item.price || 0
                );

            const total =
                Number(
                    item.total ??
                    quantity * price
                );

            return {

                medicineId:
                    item.medicineId ||
                    "",

                medicineName:
                    item.medicineName ||
                    item.name ||
                    "",

                quantity,

                price,

                total

            };

        });

    }


    /* =====================================================
       OLD SINGLE-MEDICINE BILL SUPPORT

       Purane bills bhi break nahi honge.
    ===================================================== */

    if (
        data.medicineName ||
        data.medicineId
    ) {

        const quantity =
            Number(
                data.quantity || 0
            );

        const price =
            Number(
                data.price || 0
            );

        const total =
            Number(
                data.total ??
                quantity * price
            );

        return [

            {

                medicineId:
                    data.medicineId ||
                    "",

                medicineName:
                    data.medicineName ||
                    "",

                quantity,

                price,

                total

            }

        ];

    }


    return [];
}


/* =========================================================
   CALCULATE TOTALS
========================================================= */

function calculateBillTotals(
    items,
    data
) {

    const calculatedSubtotal =
        items.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.total || 0
                ),
            0
        );


    const subtotal =
        Number(
            data.subtotal ??
            calculatedSubtotal
        );


    const discount =
        Number(
            data.discount || 0
        );


    const tax =
        Number(
            data.tax || 0
        );


    const total =
        Number(
            data.total ??
            (
                subtotal -
                discount +
                tax
            )
        );


    return {

        subtotal,

        discount,

        tax,

        total

    };
}


/* =========================================================
   CREATE BILL
========================================================= */

function createBill(data) {

    const bills =
        readBills();


    const items =
        normalizeItems(data);


    const totals =
        calculateBillTotals(
            items,
            data
        );


    const bill = {

        id:
            data.id ||
            `BILL-${Date.now()}-${Math.floor(
                Math.random() * 1000
            )}`,


        hospitalId:
            data.hospitalId ||
            "",


        patientId:
            data.patientId ||
            "",


        patientName:
            data.patientName ||
            data.patient ||
            "",


        /* =========================================
           MULTI-MEDICINE BILL
        ========================================= */

        items,


        /* =========================================
           BILL TOTALS
        ========================================= */

        subtotal:
            totals.subtotal,

        discount:
            totals.discount,

        tax:
            totals.tax,

        total:
            totals.total,


        /* =========================================
           PAYMENT
        ========================================= */

        paymentMethod:
            data.paymentMethod ||
            "cash",

        paymentStatus:
            data.paymentStatus ||
            "pending",


        /* =========================================
           PRESCRIPTION
        ========================================= */

        prescriptionRef:
            data.prescriptionRef ||
            "",


        /* =========================================
           STAFF
        ========================================= */

        createdBy:
            data.createdBy ||
            "Pharmacy Staff",


        /* =========================================
           DATE / STATUS
        ========================================= */

        createdAt:
            data.createdAt ||
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString(),

        status:
            "generated"

    };


    bills.unshift(
        bill
    );


    writeBills(
        bills
    );


    return bill;
}


/* =========================================================
   GET ALL BILLS BY HOSPITAL
========================================================= */

function getBillsByHospital(
    hospitalId
) {

    return readBills()
        .filter(
            bill =>
                bill.hospitalId ===
                hospitalId
        );
}


/* =========================================================
   GET BILL BY ID
========================================================= */

function getBillById(
    id
) {

    return readBills()
        .find(
            bill =>
                bill.id === id
        );
}


/* =========================================================
   UPDATE BILL
========================================================= */

function updateBill(
    id,
    updates
) {

    const bills =
        readBills();


    const index =
        bills.findIndex(
            bill =>
                bill.id === id
        );


    if (
        index === -1
    ) {

        return null;
    }


    /* If items are updated,
       normalize them again */

    let updatedItems =
        bills[index].items || [];


    if (
        Array.isArray(
            updates.items
        )
    ) {

        updatedItems =
            normalizeItems(
                updates
            );
    }


    const mergedData = {

        ...bills[index],

        ...updates,

        items:
            updatedItems,

        id:
            bills[index].id,

        hospitalId:
            bills[index].hospitalId,

        updatedAt:
            new Date().toISOString()

    };


    /* Recalculate totals if required */

    const totals =
        calculateBillTotals(
            mergedData.items,
            mergedData
        );


    mergedData.subtotal =
        totals.subtotal;

    mergedData.discount =
        totals.discount;

    mergedData.tax =
        totals.tax;

    mergedData.total =
        totals.total;


    bills[index] =
        mergedData;


    writeBills(
        bills
    );


    return bills[index];
}


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {

    createBill,

    getBillsByHospital,

    getBillById,

    updateBill

};