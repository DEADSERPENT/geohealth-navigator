import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://localhost:3000/api';

  static Future<List<dynamic>> getNearbyFacilities({
    required double lat,
    required double lon,
    double radius = 5000,
  }) async {
    final response = await http.get(
      Uri.parse('$baseUrl/facilities/nearby?lat=$lat&lon=$lon&radius_m=$radius'),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load facilities');
    }
  }
}
