import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class LocalDatabase {
  static Database? _database;

  static Future<Database> get database async {
    if (_database != null) return _database!;
    
    _database = await _initDB();
    return _database!;
  }

  static Future<Database> _initDB() async {
    String path = join(await getDatabasesPath(), 'geohealth.db');
    
    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) {
        return db.execute(
          'CREATE TABLE facilities(id TEXT PRIMARY KEY, name TEXT, type TEXT, lat REAL, lon REAL, available_beds INTEGER)',
        );
      },
    );
  }

  static Future<void> insertFacility(Map<String, dynamic> facility) async {
    final db = await database;
    await db.insert('facilities', facility);
  }

  static Future<List<Map<String, dynamic>>> getFacilities() async {
    final db = await database;
    return await db.query('facilities');
  }
}
