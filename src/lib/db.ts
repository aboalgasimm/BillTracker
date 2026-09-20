import Database from 'better-sqlite3';
import { neon } from '@neondatabase/serverless';
import path from 'path';
import fs from 'fs';

// Check if running on Neon (Postgres) via DATABASE_URL environment variable
const isNeon = !!process.env.DATABASE_URL;

let sqliteDb: Database.Database | null = null;
let neonInitDone = false;

function getSqliteDb(): Database.Database {
  if (!sqliteDb) {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'family_tracker.db');
    sqliteDb = new Database(dbPath);
    sqliteDb.pragma('journal_mode = WAL');
    initSqliteTables(sqliteDb);
  }
  return sqliteDb;
}

// Convert SQLite '?' parameter placeholders to Postgres '$1', '$2'...
function convertPlaceholders(sql: string): string {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

export async function initNeonDb() {
  if (!isNeon || neonInitDone) return;
  neonInitDone = true;
  const sql = neon(process.env.DATABASE_URL!);

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS family_members (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        avatar_color TEXT DEFAULT '#2563EB',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        brand TEXT,
        model TEXT,
        serial_number TEXT,
        purchase_date TEXT NOT NULL,
        price REAL DEFAULT 0,
        currency TEXT DEFAULT 'ر.س',
        purchased_by TEXT NOT NULL,
        store_name TEXT NOT NULL,
        store_phone TEXT,
        store_location TEXT,
        store_website TEXT,
        warranty_duration_months INT DEFAULT 12,
        warranty_expiration TEXT NOT NULL,
        warranty_type TEXT DEFAULT 'ضمان الشركة المصنعة',
        notes TEXT,
        receipt_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS bills (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL DEFAULT 0,
        currency TEXT DEFAULT 'ر.س',
        due_day INT DEFAULT 1,
        status TEXT DEFAULT 'unpaid',
        assigned_to TEXT NOT NULL,
        notes TEXT,
        last_paid_date TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS water_rotation (
        id SERIAL PRIMARY KEY,
        building_name TEXT DEFAULT 'ماء العمارة',
        total_turns_per_cycle INT DEFAULT 4,
        current_turn_count INT DEFAULT 2,
        is_our_turn INT DEFAULT 1,
        assigned_to TEXT DEFAULT 'مأمون',
        last_payment_date TEXT,
        notes TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS rent_payments (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        due_month TEXT NOT NULL,
        due_date TEXT NOT NULL,
        amount REAL DEFAULT 10000,
        currency TEXT DEFAULT 'ر.س',
        status TEXT DEFAULT 'unpaid',
        paid_date TEXT,
        receipt_url TEXT,
        notes TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS maintenance (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        item_name TEXT,
        frequency_months INT DEFAULT 6,
        last_service_date TEXT NOT NULL,
        next_service_date TEXT NOT NULL,
        cost REAL DEFAULT 0,
        currency TEXT DEFAULT 'ر.س',
        assigned_to TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Seed Family Members if empty
    const membersCount = await sql`SELECT COUNT(*)::int as count FROM family_members`;
    if (membersCount[0]?.count === 0) {
      await sql`INSERT INTO family_members (name, avatar_color) VALUES ('أبو القاسم', '#2563EB'), ('يمنى', '#DB2777'), ('مأمون', '#059669'), ('هالة', '#7C3AED') ON CONFLICT DO NOTHING`;
    }

    // Seed Items if empty
    const itemsCount = await sql`SELECT COUNT(*)::int as count FROM items`;
    if (itemsCount[0]?.count === 0) {
      await sql`
        INSERT INTO items (name, category, brand, model, serial_number, purchase_date, price, currency, purchased_by, store_name, store_phone, store_location, store_website, warranty_duration_months, warranty_expiration, warranty_type, notes)
        VALUES 
        ('تلفزيون إل جي 65 بوصة 4K ذكي', 'إلكترونيات', 'LG', 'OLED65C3', 'LG-TV-994821-X', '2025-10-15', 5625, 'ر.س', 'أبو القاسم', 'إكسترا (eXtra)', '+966 9200 04444', 'فرع الطريق الدائري', 'https://www.extra.com', 12, '2026-10-15', 'ضمان الشركة المصنعة', 'تم الشراء أثناء العروض السنوية. مضاف معه حامل جداري.'),
        ('مكنسة دايسون V15 اللاسلكية', 'أجهزة منزلية', 'Dyson', 'V15 Detect', 'DY-V15-88310-A', '2026-01-10', 2800, 'ر.س', 'يمنى', 'جرير (Jarir Bookstore)', '+966 9200 00089', 'فرع مجمع العرب', 'https://www.jarir.com', 24, '2028-01-10', 'ضمان الموزع المعتمد', 'سجلنا الضمان سنتين عبر موقع دايسون الرسمي.'),
        ('ماكينة إسبيرسو بريفيل باريستا تاتش', 'أدوات المطبخ', 'Breville', 'BES880BSS', 'BV-EXP-44021', '2024-05-20', 3750, 'ر.س', 'مأمون', 'ساكو (SACO)', '+966 9200 00888', 'طريق الملك فهد', 'https://www.saco.htm', 12, '2025-05-20', 'ضمان متجر ساكو الممتد', 'ماكينة القهوة الرئيسية للمنزل. تم تغيير فلتر الماء في مارس.'),
        ('آيباد برو 12.9 بوصة M2', 'تقنية وشخصية', 'Apple', 'MNXR3LL/A', 'DLXKZ001M2', '2026-03-01', 4120, 'ر.س', 'هالة', 'حاسبات العرب (أبل حاسبات)', '+966 9200 00445', 'مول الريدسي', 'https://www.arabcalculators.com', 24, '2028-03-01', 'AppleCare+ حماية شاملة', 'مشمول بحماية أبل كير بلس ضد الحوادث والأعطال.')
      `;
    }

    // Seed Bills if empty
    const billsCount = await sql`SELECT COUNT(*)::int as count FROM bills`;
    if (billsCount[0]?.count === 0) {
      await sql`
        INSERT INTO bills (title, category, amount, currency, due_day, status, assigned_to, notes)
        VALUES
        ('فاتورة الكهرباء الشهرية', 'electricity', 350, 'ر.س', 25, 'unpaid', 'أبو القاسم', 'تسدد عبر تطبيق الراجحي / سداد'),
        ('اشتراك إنترنت ألياف بصرية STC', 'wifi', 287.5, 'ر.س', 1, 'paid', 'أبو القاسم', 'باقة 300 ميجا للمنزل'),
        ('تأمين العربية السنوي', 'car_insurance', 1200, 'ر.س', 15, 'due_soon', 'مأمون', 'تأمين شامل عبر منصة بي Fort'),
        ('قسط العربية الشهري', 'car_payment', 1450, 'ر.س', 10, 'unpaid', 'مأمون', 'استقطاب شهري تلقائي')
      `;
    }

    // Seed Water Rotation if empty
    const waterCount = await sql`SELECT COUNT(*)::int as count FROM water_rotation`;
    if (waterCount[0]?.count === 0) {
      await sql`
        INSERT INTO water_rotation (building_name, total_turns_per_cycle, current_turn_count, is_our_turn, assigned_to, notes)
        VALUES ('فاتورة ماء العمارة', 4, 2, 1, 'مأمون', 'نظام العمارة: كل شقة تدفع 4 مرات متتالية ثم تنتقل الدورة للشقة التالية. المسجل الحالي: مأمون.')
      `;
    }

    // Seed Rent Payments if empty
    const rentCount = await sql`SELECT COUNT(*)::int as count FROM rent_payments`;
    if (rentCount[0]?.count === 0) {
      await sql`
        INSERT INTO rent_payments (title, due_month, due_date, amount, currency, status, notes)
        VALUES
        ('دفعة إيجار النصف الأول (يونيو)', 'june', '2026-06-01', 10000, 'ر.س', 'unpaid', 'مبلغ 10,000 ريال يحول لحساب مالك العقار في شهر يونيو'),
        ('دفعة إيجار النصف الثاني (ديسمبر)', 'december', '2026-12-01', 10000, 'ر.س', 'unpaid', 'مبلغ 10,000 ريال يحول لحساب مالك العقار في شهر ديسمبر')
      `;
    }

    // Seed Maintenance if empty
    const maintCount = await sql`SELECT COUNT(*)::int as count FROM maintenance`;
    if (maintCount[0]?.count === 0) {
      await sql`
        INSERT INTO maintenance (title, category, item_name, frequency_months, last_service_date, next_service_date, cost, currency, assigned_to, notes)
        VALUES
        ('تغيير زيت وفلتر المحرك للعربية', 'car', 'تويوتا كامري 2024', 6, '2026-04-10', '2026-10-10', 250, 'ر.س', 'مأمون', 'زيت تخليقي بالكامل 10,000 كم لدى مركز بترومين.'),
        ('غسيل وتنظيف فلاتر المكيفات المنزلية', 'home', 'مكيفات الشقة', 3, '2026-07-01', '2026-10-01', 180, 'ر.س', 'أبو القاسم', 'تنظيف وغسيل فلاتر المكيفات قبل الموسم.'),
        ('إزالة الترسبات وتغيير فلتر ماكينة القهوة', 'appliance', 'Breville Barista Espresso', 4, '2026-05-15', '2026-09-15', 75, 'ر.س', 'مأمون', 'تنظيف الدورة الداخلية بالمسحوق الخاص وتغيير الفلتر.')
      `;
    }
  } catch (err) {
    console.error('Error initializing Neon DB:', err);
  }
}

export async function query<T = any>(sqlStr: string, params: any[] = []): Promise<T[]> {
  if (isNeon) {
    await initNeonDb();
    const sql = neon(process.env.DATABASE_URL!) as any;
    const pgSql = convertPlaceholders(sqlStr);
    const rows = await sql(pgSql, params);
    return rows as T[];
  } else {
    const db = getSqliteDb();
    return db.prepare(sqlStr).all(...params) as T[];
  }
}

export async function queryOne<T = any>(sqlStr: string, params: any[] = []): Promise<T | undefined> {
  if (isNeon) {
    const rows = await query<T>(sqlStr, params);
    return rows[0];
  } else {
    const db = getSqliteDb();
    return db.prepare(sqlStr).get(...params) as T | undefined;
  }
}

export async function execute(sqlStr: string, params: any[] = []): Promise<{ lastInsertRowid?: number | string; changes?: number }> {
  if (isNeon) {
    await initNeonDb();
    const sql = neon(process.env.DATABASE_URL!) as any;
    let pgSql = convertPlaceholders(sqlStr);
    
    // Add RETURNING id for INSERT queries if not present
    const isInsert = pgSql.trim().toUpperCase().startsWith('INSERT');
    if (isInsert && !pgSql.toUpperCase().includes('RETURNING')) {
      pgSql += ' RETURNING id';
    }

    const rows = await sql(pgSql, params);
    const lastId = rows && rows[0] && rows[0].id ? rows[0].id : undefined;
    return { lastInsertRowid: lastId, changes: rows.length };
  } else {
    const db = getSqliteDb();
    const info = db.prepare(sqlStr).run(...params);
    return { lastInsertRowid: Number(info.lastInsertRowid), changes: info.changes };
  }
}

// Keep getDb helper for sqlite fallback compatibility
export function getDb(): Database.Database {
  return getSqliteDb();
}

function initSqliteTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS family_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      avatar_color TEXT DEFAULT '#2563EB',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      brand TEXT,
      model TEXT,
      serial_number TEXT,
      purchase_date TEXT NOT NULL,
      price REAL DEFAULT 0,
      currency TEXT DEFAULT 'ر.س',
      purchased_by TEXT NOT NULL,
      store_name TEXT NOT NULL,
      store_phone TEXT,
      store_location TEXT,
      store_website TEXT,
      warranty_duration_months INTEGER DEFAULT 12,
      warranty_expiration TEXT NOT NULL,
      warranty_type TEXT DEFAULT 'ضمان الشركة المصنعة',
      notes TEXT,
      receipt_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL DEFAULT 0,
      currency TEXT DEFAULT 'ر.س',
      due_day INTEGER DEFAULT 1,
      status TEXT DEFAULT 'unpaid',
      assigned_to TEXT NOT NULL,
      notes TEXT,
      last_paid_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS water_rotation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_name TEXT DEFAULT 'ماء العمارة',
      total_turns_per_cycle INTEGER DEFAULT 4,
      current_turn_count INTEGER DEFAULT 2,
      is_our_turn INTEGER DEFAULT 1,
      assigned_to TEXT DEFAULT 'مأمون',
      last_payment_date TEXT,
      notes TEXT
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS rent_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      due_month TEXT NOT NULL,
      due_date TEXT NOT NULL,
      amount REAL DEFAULT 10000,
      currency TEXT DEFAULT 'ر.س',
      status TEXT DEFAULT 'unpaid',
      paid_date TEXT,
      receipt_url TEXT,
      notes TEXT
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS maintenance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      item_name TEXT,
      frequency_months INTEGER DEFAULT 6,
      last_service_date TEXT NOT NULL,
      next_service_date TEXT NOT NULL,
      cost REAL DEFAULT 0,
      currency TEXT DEFAULT 'ر.س',
      assigned_to TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const countMembers = db.prepare('SELECT COUNT(*) as count FROM family_members').get() as { count: number };
  if (countMembers.count === 0) {
    const seedMembers = [
      { name: 'أبو القاسم', color: '#2563EB' },
      { name: 'يمنى', color: '#DB2777' },
      { name: 'مأمون', color: '#059669' },
      { name: 'هالة', color: '#7C3AED' }
    ];
    const insertMember = db.prepare('INSERT INTO family_members (name, avatar_color) VALUES (?, ?)');
    for (const m of seedMembers) {
      insertMember.run(m.name, m.color);
    }
  }

  const countItems = db.prepare('SELECT COUNT(*) as count FROM items').get() as { count: number };
  if (countItems.count === 0) {
    const insertItem = db.prepare(`
      INSERT INTO items (
        name, category, brand, model, serial_number, purchase_date, price, currency,
        purchased_by, store_name, store_phone, store_location, store_website,
        warranty_duration_months, warranty_expiration, warranty_type, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertItem.run(
      'تلفزيون إل جي 65 بوصة 4K ذكي',
      'إلكترونيات',
      'LG',
      'OLED65C3',
      'LG-TV-994821-X',
      '2025-10-15',
      5625,
      'ر.س',
      'أبو القاسم',
      'إكسترا (eXtra)',
      '+966 9200 04444',
      'فرع الطريق الدائري',
      'https://www.extra.com',
      12,
      '2026-10-15',
      'ضمان الشركة المصنعة',
      'تم الشراء أثناء العروض السنوية. مضاف معه حامل جداري.'
    );

    insertItem.run(
      'مكنسة دايسون V15 اللاسلكية',
      'أجهزة منزلية',
      'Dyson',
      'V15 Detect',
      'DY-V15-88310-A',
      '2026-01-10',
      2800,
      'ر.س',
      'يمنى',
      'جرير (Jarir Bookstore)',
      '+966 9200 00089',
      'فرع مجمع العرب',
      'https://www.jarir.com',
      24,
      '2028-01-10',
      'ضمان الموزع المعتمد',
      'سجلنا الضمان سنتين عبر موقع دايسون الرسمي.'
    );

    insertItem.run(
      'ماكينة إسبيرسو بريفيل باريستا تاتش',
      'أدوات المطبخ',
      'Breville',
      'BES880BSS',
      'BV-EXP-44021',
      '2024-05-20',
      3750,
      'ر.س',
      'مأمون',
      'ساكو (SACO)',
      '+966 9200 00888',
      'طريق الملك فهد',
      'https://www.saco.htm',
      12,
      '2025-05-20',
      'ضمان متجر ساكو الممتد',
      'ماكينة القهوة الرئيسية للمنزل. تم تغيير فلتر الماء في مارس.'
    );

    insertItem.run(
      'آيباد برو 12.9 بوصة M2',
      'تقنية وشخصية',
      'Apple',
      'MNXR3LL/A',
      'DLXKZ001M2',
      '2026-03-01',
      4120,
      'ر.س',
      'هالة',
      'حاسبات العرب (أبل حاسبات)',
      '+966 9200 00445',
      'مول الريدسي',
      'https://www.arabcalculators.com',
      24,
      '2028-03-01',
      'AppleCare+ حماية شاملة',
      'مشمول بحماية أبل كير بلس ضد الحوادث والأعطال.'
    );
  }

  const countBills = db.prepare('SELECT COUNT(*) as count FROM bills').get() as { count: number };
  if (countBills.count === 0) {
    const insertBill = db.prepare(`
      INSERT INTO bills (title, category, amount, currency, due_day, status, assigned_to, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertBill.run('فاتورة الكهرباء الشهرية', 'electricity', 350, 'ر.س', 25, 'unpaid', 'أبو القاسم', 'تسدد عبر تطبيق الراجحي / سداد');
    insertBill.run('اشتراك إنترنت ألياف بصرية STC', 'wifi', 287.5, 'ر.س', 1, 'paid', 'أبو القاسم', 'باقة 300 ميجا للمنزل');
    insertBill.run('تأمين العربية السنوي', 'car_insurance', 1200, 'ر.س', 15, 'due_soon', 'مأمون', 'تأمين شامل عبر منصة بي Fort');
    insertBill.run('قسط العربية الشهري', 'car_payment', 1450, 'ر.س', 10, 'unpaid', 'مأمون', 'استقطاب شهري تلقائي');
  }

  const countWater = db.prepare('SELECT COUNT(*) as count FROM water_rotation').get() as { count: number };
  if (countWater.count === 0) {
    db.exec(`
      INSERT INTO water_rotation (building_name, total_turns_per_cycle, current_turn_count, is_our_turn, assigned_to, notes)
      VALUES ('فاتورة ماء العمارة', 4, 2, 1, 'مأمون', 'نظام العمارة: كل شقة تدفع 4 مرات متتالية ثم تنتقل الدورة للشقة التالية. المسجل الحالي: مأمون.')
    `);
  }

  const countRent = db.prepare('SELECT COUNT(*) as count FROM rent_payments').get() as { count: number };
  if (countRent.count === 0) {
    const insertRent = db.prepare(`
      INSERT INTO rent_payments (title, due_month, due_date, amount, currency, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertRent.run('دفعة إيجار النصف الأول (يونيو)', 'june', '2026-06-01', 10000, 'ر.س', 'unpaid', 'مبلغ 10,000 ريال يحول لحساب مالك العقار في شهر يونيو');
    insertRent.run('دفعة إيجار النصف الثاني (ديسمبر)', 'december', '2026-12-01', 10000, 'ر.س', 'unpaid', 'مبلغ 10,000 ريال يحول لحساب مالك العقار في شهر ديسمبر');
  }

  const countMaintenance = db.prepare('SELECT COUNT(*) as count FROM maintenance').get() as { count: number };
  if (countMaintenance.count === 0) {
    const insertMaint = db.prepare(`
      INSERT INTO maintenance (title, category, item_name, frequency_months, last_service_date, next_service_date, cost, currency, assigned_to, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertMaint.run(
      'تغيير زيت وفلتر المحرك للعربية',
      'car',
      'تويوتا كامري 2024',
      6,
      '2026-04-10',
      '2026-10-10',
      250,
      'ر.س',
      'مأمون',
      'زيت تخليقي بالكامل 10,000 كم لدى مركز بترومين.'
    );

    insertMaint.run(
      'غسيل وتنظيف فلاتر المكيفات المنزلية',
      'home',
      'مكيفات الشقة',
      3,
      '2026-07-01',
      '2026-10-01',
      180,
      'ر.س',
      'أبو القاسم',
      'تنظيف وغسيل فلاتر المكيفات قبل الموسم.'
    );

    insertMaint.run(
      'إزالة الترسبات وتغيير فلتر ماكينة القهوة',
      'appliance',
      'Breville Barista Espresso',
      4,
      '2026-05-15',
      '2026-09-15',
      75,
      'ر.س',
      'مأمون',
      'تنظيف الدورة الداخلية بالمسحوق الخاص وتغيير الفلتر.'
    );
  }

  db.exec(`
    UPDATE bills SET title = REPLACE(title, 'السيارة', 'العربية') WHERE title LIKE '%السيارة%';
    UPDATE bills SET title = REPLACE(title, 'سيارة', 'عربية') WHERE title LIKE '%سيارة%';
    UPDATE maintenance SET title = REPLACE(title, 'السيارة', 'العربية') WHERE title LIKE '%السيارة%';
    UPDATE maintenance SET title = REPLACE(title, 'سيارة', 'عربية') WHERE title LIKE '%سيارة%';
  `);
}
