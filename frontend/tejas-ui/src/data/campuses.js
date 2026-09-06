/**
 * TEJAS GRID - Rajasthan Technical Education Campuses Metadata
 * Official 20 Anchor Campuses under the Directorate of Technical Education (DTE).
 * Strictly NO emojis - use Lucide icons for UI representation.
 */

export const RAJASTHAN_CAMPUSES = [
  {
    "id": 1,
    "name": "BTU / Govt Engg College Bikaner",
    "shortName": "BTU Bikaner",
    "district": "Bikaner",
    "districtCode": "BKN",
    "operatorUsername": "operator_bikaner",
    "studentUsername": "student_bikaner",
    "engineerName": "Er. Rameshwar Lal",
    "engineerTitle": "Chief Microgrid Engineer & SCADA Director",
    "badgeId": "OP-BKN-01",
    "sanctionedLoadKw": 400,
    "solarCapacityKw": 320,
    "windCapacityKw": 80,
    "batteryCapacityKwh": 200,
    "latitude": 28.0229,
    "longitude": 73.3119,
    "isMajorHub": true,
    "hostels": [
      {
        "id": 1,
        "name": "Block A (Aryabhata)",
        "residents": 220,
        "savedKwh": 2110.5,
        "karma": 1170
      },
      {
        "id": 2,
        "name": "Block B (Bhaskara)",
        "residents": 195,
        "savedKwh": 1870,
        "karma": 980
      },
      {
        "id": 3,
        "name": "Block C (Charaka)",
        "residents": 170,
        "savedKwh": 1630.2,
        "karma": 850
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "Udayraj Suthar",
        "regNo": "24BTU101",
        "email": "udayraj.btu@campus.tejas.edu",
        "phone": "+91 82388 93551",
        "cleanPhone": "918238893551",
        "hostel": "Block A (Aryabhata)",
        "room": "A-302",
        "karmaPoints": 1170,
        "badge": "ENERGY CHAMPION",
        "year": "3rd Year B.Tech",
        "dept": "Electrical Engineering"
      },
      {
        "id": 2,
        "name": "Aniket Gawai",
        "regNo": "24BTU102",
        "email": "aniket.btu@campus.tejas.edu",
        "phone": "+91 94140 11002",
        "cleanPhone": "919414011002",
        "hostel": "Block B (Bhaskara)",
        "room": "B-210",
        "karmaPoints": 780,
        "badge": "SOLAR GUARDIAN",
        "year": "2nd Year B.Tech",
        "dept": "Computer Science"
      },
      {
        "id": 3,
        "name": "Pooja Choudhary",
        "regNo": "24BTU103",
        "email": "pooja.btu@campus.tejas.edu",
        "phone": "+91 94140 11003",
        "cleanPhone": "919414011003",
        "hostel": "Block C (Charaka)",
        "room": "C-104",
        "karmaPoints": 540,
        "badge": "GREEN CADET",
        "year": "1st Year B.Tech",
        "dept": "Electronics & Comm"
      }
    ]
  },
  {
    "id": 2,
    "name": "MNIT / UNIRAJ Campus",
    "shortName": "MNIT / UNIRAJ Jaipur",
    "district": "Jaipur",
    "districtCode": "JPR",
    "operatorUsername": "operator_jaipur",
    "studentUsername": "student_jaipur",
    "engineerName": "Er. Suman Sharma",
    "engineerTitle": "Station SCADA Engineer",
    "badgeId": "OP-JPR-02",
    "sanctionedLoadKw": 500,
    "solarCapacityKw": 350,
    "windCapacityKw": 50,
    "batteryCapacityKwh": 200,
    "latitude": 26.9124,
    "longitude": 75.7873,
    "isMajorHub": true,
    "hostels": [
      {
        "id": 4,
        "name": "Gargi Bhawan - MNIT Jaipur",
        "residents": 180,
        "savedKwh": 2450,
        "karma": 1280
      },
      {
        "id": 5,
        "name": "Tagore Bhawan - MNIT Jaipur",
        "residents": 210,
        "savedKwh": 2120,
        "karma": 1150
      },
      {
        "id": 6,
        "name": "Raman Bhawan - MNIT Jaipur",
        "residents": 190,
        "savedKwh": 1890,
        "karma": 980
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "Priya Sharma",
        "regNo": "24MNIT201",
        "email": "priya.sharma@campus.tejas.edu",
        "phone": "+91 94140 12001",
        "cleanPhone": "919414012001",
        "hostel": "Gargi Bhawan - MNIT Jaipur",
        "room": "G-204",
        "karmaPoints": 1280,
        "badge": "ENERGY CHAMPION",
        "year": "3rd Year B.Tech",
        "dept": "Renewable Energy Systems"
      },
      {
        "id": 2,
        "name": "Rahul Verma",
        "regNo": "24MNIT202",
        "email": "rahul.verma@campus.tejas.edu",
        "phone": "+91 94140 12002",
        "cleanPhone": "919414012002",
        "hostel": "Tagore Bhawan - MNIT Jaipur",
        "room": "T-312",
        "karmaPoints": 920,
        "badge": "SOLAR GUARDIAN",
        "year": "4th Year B.Tech",
        "dept": "Mechanical Engineering"
      },
      {
        "id": 3,
        "name": "Aditi Saxena",
        "regNo": "24MNIT203",
        "email": "aditi.saxena@campus.tejas.edu",
        "phone": "+91 94140 12003",
        "cleanPhone": "919414012003",
        "hostel": "Raman Bhawan - MNIT Jaipur",
        "room": "R-105",
        "karmaPoints": 610,
        "badge": "GREEN CADET",
        "year": "2nd Year B.Tech",
        "dept": "Civil Engineering"
      }
    ]
  },
  {
    "id": 3,
    "name": "IIT Jodhpur / JNVU Campus",
    "shortName": "IIT Jodhpur",
    "district": "Jodhpur",
    "districtCode": "JDH",
    "operatorUsername": "operator_jodhpur",
    "studentUsername": "student_jodhpur",
    "engineerName": "Er. Mahendra Singh",
    "engineerTitle": "Station SCADA Engineer",
    "badgeId": "OP-JDH-03",
    "sanctionedLoadKw": 600,
    "solarCapacityKw": 450,
    "windCapacityKw": 100,
    "batteryCapacityKwh": 300,
    "latitude": 26.2389,
    "longitude": 73.0243,
    "isMajorHub": true,
    "hostels": [
      {
        "id": 7,
        "name": "Kalpana Chawla Hall - IIT Jodhpur",
        "residents": 160,
        "savedKwh": 2680,
        "karma": 1420
      },
      {
        "id": 8,
        "name": "Mehrangarh Residency - JNVU Jodhpur",
        "residents": 240,
        "savedKwh": 2310,
        "karma": 1210
      },
      {
        "id": 9,
        "name": "Marwar Student Wing - IIT Jodhpur",
        "residents": 175,
        "savedKwh": 1940,
        "karma": 1040
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "Kunal Rathore",
        "regNo": "24IITJ301",
        "email": "kunal.rathore@campus.tejas.edu",
        "phone": "+91 94140 13001",
        "cleanPhone": "919414013001",
        "hostel": "Kalpana Chawla Hall - IIT Jodhpur",
        "room": "K-108",
        "karmaPoints": 1420,
        "badge": "ENERGY CHAMPION",
        "year": "3rd Year B.Tech",
        "dept": "Electrical Engineering"
      },
      {
        "id": 2,
        "name": "Meera Shekhawat",
        "regNo": "24IITJ302",
        "email": "meera.shekhawat@campus.tejas.edu",
        "phone": "+91 94140 13002",
        "cleanPhone": "919414013002",
        "hostel": "Mehrangarh Residency - JNVU Jodhpur",
        "room": "M-401",
        "karmaPoints": 1050,
        "badge": "SOLAR GUARDIAN",
        "year": "3rd Year B.Tech",
        "dept": "Data Science & AI"
      },
      {
        "id": 3,
        "name": "Harshvardhan Bhati",
        "regNo": "24IITJ303",
        "email": "harsh.bhati@campus.tejas.edu",
        "phone": "+91 94140 13003",
        "cleanPhone": "919414013003",
        "hostel": "Marwar Student Wing - IIT Jodhpur",
        "room": "W-206",
        "karmaPoints": 730,
        "badge": "GREEN CADET",
        "year": "2nd Year B.Tech",
        "dept": "Chemical Engineering"
      }
    ]
  },
  {
    "id": 4,
    "name": "RTU / Govt Poly College",
    "shortName": "RTU Kota",
    "district": "Kota",
    "districtCode": "KOTA",
    "operatorUsername": "operator_kota",
    "studentUsername": "student_kota",
    "engineerName": "Er. Ankit Agrawal",
    "engineerTitle": "Station SCADA Engineer",
    "badgeId": "OP-KOT-04",
    "sanctionedLoadKw": 400,
    "solarCapacityKw": 250,
    "windCapacityKw": 30,
    "batteryCapacityKwh": 150,
    "latitude": 25.2138,
    "longitude": 75.8648,
    "isMajorHub": true,
    "hostels": [
      {
        "id": 10,
        "name": "Chambal Bhawan - RTU Kota",
        "residents": 220,
        "savedKwh": 2590,
        "karma": 1360
      },
      {
        "id": 11,
        "name": "Ramanujan Hall - RTU Kota",
        "residents": 195,
        "savedKwh": 2240,
        "karma": 1190
      },
      {
        "id": 12,
        "name": "Kota Barrage Wing - Poly Kota",
        "residents": 180,
        "savedKwh": 1820,
        "karma": 950
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "Siddharth Mittal",
        "regNo": "24RTU401",
        "email": "siddharth.mittal@campus.tejas.edu",
        "phone": "+91 94140 14001",
        "cleanPhone": "919414014001",
        "hostel": "Chambal Bhawan - RTU Kota",
        "room": "C-202",
        "karmaPoints": 1360,
        "badge": "ENERGY CHAMPION",
        "year": "3rd Year B.Tech",
        "dept": "Power Systems Engineering"
      },
      {
        "id": 2,
        "name": "Neha Khandelwal",
        "regNo": "24RTU402",
        "email": "neha.khandelwal@campus.tejas.edu",
        "phone": "+91 94140 14002",
        "cleanPhone": "919414014002",
        "hostel": "Ramanujan Hall - RTU Kota",
        "room": "R-315",
        "karmaPoints": 980,
        "badge": "SOLAR GUARDIAN",
        "year": "2nd Year B.Tech",
        "dept": "Information Technology"
      },
      {
        "id": 3,
        "name": "Aman Maheshwari",
        "regNo": "24RTU403",
        "email": "aman.maheshwari@campus.tejas.edu",
        "phone": "+91 94140 14003",
        "cleanPhone": "919414014003",
        "hostel": "Kota Barrage Wing - Poly Kota",
        "room": "B-110",
        "karmaPoints": 640,
        "badge": "GREEN CADET",
        "year": "1st Year Diploma",
        "dept": "Electrical Engineering"
      }
    ]
  },
  {
    "id": 5,
    "name": "MLSU / CTAE MPUAT Campus",
    "shortName": "CTAE Udaipur",
    "district": "Udaipur",
    "districtCode": "UDZ",
    "operatorUsername": "operator_udaipur",
    "studentUsername": "student_udaipur",
    "engineerName": "Er. Vikas Meena",
    "engineerTitle": "Station SCADA Engineer",
    "badgeId": "OP-UDZ-05",
    "sanctionedLoadKw": 450,
    "solarCapacityKw": 300,
    "windCapacityKw": 40,
    "batteryCapacityKwh": 180,
    "latitude": 24.5854,
    "longitude": 73.7125,
    "isMajorHub": true,
    "hostels": [
      {
        "id": 13,
        "name": "Maharana Pratap Bhawan - CTAE Udaipur",
        "residents": 205,
        "savedKwh": 2740,
        "karma": 1450
      },
      {
        "id": 14,
        "name": "Saheliyon Bhawan - MLSU Udaipur",
        "residents": 170,
        "savedKwh": 2380,
        "karma": 1250
      },
      {
        "id": 15,
        "name": "Fateh Sagar Wing - CTAE Udaipur",
        "residents": 160,
        "savedKwh": 1910,
        "karma": 1010
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "Vikramaditya Rawat",
        "regNo": "24CTAE501",
        "email": "vikramaditya.rawat@campus.tejas.edu",
        "phone": "+91 94140 15001",
        "cleanPhone": "919414015001",
        "hostel": "Maharana Pratap Bhawan - CTAE Udaipur",
        "room": "MP-301",
        "karmaPoints": 1450,
        "badge": "ENERGY CHAMPION",
        "year": "4th Year B.Tech",
        "dept": "Agricultural & Microgrid Engg"
      },
      {
        "id": 2,
        "name": "Divya Menaria",
        "regNo": "24CTAE502",
        "email": "divya.menaria@campus.tejas.edu",
        "phone": "+91 94140 15002",
        "cleanPhone": "919414015002",
        "hostel": "Saheliyon Bhawan - MLSU Udaipur",
        "room": "S-104",
        "karmaPoints": 1120,
        "badge": "SOLAR GUARDIAN",
        "year": "3rd Year B.Tech",
        "dept": "Mining & Environmental Engg"
      },
      {
        "id": 3,
        "name": "Bhavik Jain",
        "regNo": "24CTAE503",
        "email": "bhavik.jain@campus.tejas.edu",
        "phone": "+91 94140 15003",
        "cleanPhone": "919414015003",
        "hostel": "Fateh Sagar Wing - CTAE Udaipur",
        "room": "FS-208",
        "karmaPoints": 810,
        "badge": "GREEN CADET",
        "year": "2nd Year B.Tech",
        "dept": "Computer Science"
      }
    ]
  },
  {
    "id": 6,
    "name": "Govt Engineering College Ajmer",
    "shortName": "GEC Ajmer",
    "district": "Ajmer",
    "districtCode": "AJM",
    "operatorUsername": "operator_ajmer",
    "studentUsername": "student_ajmer",
    "engineerName": "Er. Sunita Choudhary",
    "engineerTitle": "Station SCADA Engineer",
    "badgeId": "OP-AJM-06",
    "sanctionedLoadKw": 300,
    "solarCapacityKw": 200,
    "windCapacityKw": 40,
    "batteryCapacityKwh": 120,
    "latitude": 26.4499,
    "longitude": 74.6399,
    "isMajorHub": false,
    "hostels": [
      {
        "id": 16,
        "name": "Ana Sagar Bhawan - GEC Ajmer",
        "residents": 150,
        "savedKwh": 1950,
        "karma": 1050
      },
      {
        "id": 17,
        "name": "Prithviraj Chauhan Hall - GEC Ajmer",
        "residents": 180,
        "savedKwh": 1780,
        "karma": 970
      },
      {
        "id": 18,
        "name": "Taragarh Student Wing - GEC Ajmer",
        "residents": 140,
        "savedKwh": 1520,
        "karma": 830
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "Saurabh Tanwar",
        "regNo": "24GECA601",
        "email": "saurabh.tanwar@campus.tejas.edu",
        "phone": "+91 94140 16001",
        "cleanPhone": "919414016001",
        "hostel": "Ana Sagar Bhawan - GEC Ajmer",
        "room": "AS-102",
        "karmaPoints": 1050,
        "badge": "ENERGY CHAMPION",
        "year": "3rd Year B.Tech",
        "dept": "Instrumentation & Control"
      },
      {
        "id": 2,
        "name": "Ritu Tak",
        "regNo": "24GECA602",
        "email": "ritu.tak@campus.tejas.edu",
        "phone": "+91 94140 16002",
        "cleanPhone": "919414016002",
        "hostel": "Prithviraj Chauhan Hall - GEC Ajmer",
        "room": "PC-205",
        "karmaPoints": 840,
        "badge": "SOLAR GUARDIAN",
        "year": "2nd Year B.Tech",
        "dept": "Electrical Engineering"
      },
      {
        "id": 3,
        "name": "Mohit Vaishnav",
        "regNo": "24GECA603",
        "email": "mohit.vaishnav@campus.tejas.edu",
        "phone": "+91 94140 16003",
        "cleanPhone": "919414016003",
        "hostel": "Taragarh Student Wing - GEC Ajmer",
        "room": "TG-303",
        "karmaPoints": 620,
        "badge": "GREEN CADET",
        "year": "1st Year B.Tech",
        "dept": "Mechanical Engineering"
      }
    ]
  },
  {
    "id": 7,
    "name": "RRBMU / Govt Arts College",
    "shortName": "RRBMU Alwar",
    "district": "Alwar",
    "districtCode": "ALW",
    "operatorUsername": "operator_alwar",
    "studentUsername": "student_alwar",
    "engineerName": "Er. Deepak Yadav",
    "engineerTitle": "Station SCADA Engineer",
    "badgeId": "OP-ALW-07",
    "sanctionedLoadKw": 250,
    "solarCapacityKw": 180,
    "windCapacityKw": 20,
    "batteryCapacityKwh": 100,
    "latitude": 27.553,
    "longitude": 76.6346,
    "isMajorHub": false,
    "hostels": [
      {
        "id": 19,
        "name": "Sariska Eco Bhawan - RRBMU Alwar",
        "residents": 140,
        "savedKwh": 1880,
        "karma": 1020
      },
      {
        "id": 20,
        "name": "Bala Qila Hall - Govt College Alwar",
        "residents": 160,
        "savedKwh": 1690,
        "karma": 920
      },
      {
        "id": 21,
        "name": "Matsya Student Hostel - RRBMU Alwar",
        "residents": 130,
        "savedKwh": 1410,
        "karma": 790
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "Tarun Yadav",
        "regNo": "24RRB701",
        "email": "tarun.yadav@campus.tejas.edu",
        "phone": "+91 94140 17001",
        "cleanPhone": "919414017001",
        "hostel": "Sariska Eco Bhawan - RRBMU Alwar",
        "room": "SE-201",
        "karmaPoints": 1020,
        "badge": "ENERGY CHAMPION",
        "year": "3rd Year B.Tech",
        "dept": "Computer Science"
      },
      {
        "id": 2,
        "name": "Sneha Naruka",
        "regNo": "24RRB702",
        "email": "sneha.naruka@campus.tejas.edu",
        "phone": "+91 94140 17002",
        "cleanPhone": "919414017002",
        "hostel": "Bala Qila Hall - Govt College Alwar",
        "room": "BQ-108",
        "karmaPoints": 790,
        "badge": "SOLAR GUARDIAN",
        "year": "2nd Year B.Sc",
        "dept": "Renewable Tech"
      },
      {
        "id": 3,
        "name": "Lokesh Gurjar",
        "regNo": "24RRB703",
        "email": "lokesh.gurjar@campus.tejas.edu",
        "phone": "+91 94140 17003",
        "cleanPhone": "919414017003",
        "hostel": "Matsya Student Hostel - RRBMU Alwar",
        "room": "MS-304",
        "karmaPoints": 580,
        "badge": "GREEN CADET",
        "year": "1st Year B.Tech",
        "dept": "Civil Engineering"
      }
    ]
  },
  {
    "id": 8,
    "name": "Pandit Deendayal Upadhyaya Shekhawati Univ",
    "shortName": "PDUSU Sikar",
    "district": "Sikar",
    "districtCode": "SKR",
    "operatorUsername": "operator_sikar",
    "studentUsername": "student_sikar",
    "engineerName": "Er. Manoj Kumawat",
    "engineerTitle": "Station SCADA Engineer",
    "badgeId": "OP-SKR-08",
    "sanctionedLoadKw": 280,
    "solarCapacityKw": 220,
    "windCapacityKw": 35,
    "batteryCapacityKwh": 120,
    "latitude": 27.6094,
    "longitude": 75.1399,
    "isMajorHub": false,
    "hostels": [
      {
        "id": 22,
        "name": "Shekhawati Bhawan - Sikar Campus",
        "residents": 155,
        "savedKwh": 1830,
        "karma": 990
      },
      {
        "id": 23,
        "name": "Khatu Shyam Hall - PDUSU Sikar",
        "residents": 170,
        "savedKwh": 1640,
        "karma": 890
      },
      {
        "id": 24,
        "name": "Jeendmata Wing - Sikar Campus",
        "residents": 135,
        "savedKwh": 1390,
        "karma": 760
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "Vikas Nehra",
        "regNo": "24PDU801",
        "email": "vikas.nehra@campus.tejas.edu",
        "phone": "+91 94140 18001",
        "cleanPhone": "919414018001",
        "hostel": "Shekhawati Bhawan - Sikar Campus",
        "room": "SB-302",
        "karmaPoints": 990,
        "badge": "ENERGY CHAMPION",
        "year": "3rd Year B.Tech",
        "dept": "Electrical Engineering"
      },
      {
        "id": 2,
        "name": "Payal Dhayal",
        "regNo": "24PDU802",
        "email": "payal.dhayal@campus.tejas.edu",
        "phone": "+91 94140 18002",
        "cleanPhone": "919414018002",
        "hostel": "Khatu Shyam Hall - PDUSU Sikar",
        "room": "KS-204",
        "karmaPoints": 760,
        "badge": "SOLAR GUARDIAN",
        "year": "2nd Year B.Tech",
        "dept": "Electronics Engineering"
      },
      {
        "id": 3,
        "name": "Deepak Saini",
        "regNo": "24PDU803",
        "email": "deepak.saini@campus.tejas.edu",
        "phone": "+91 94140 18003",
        "cleanPhone": "919414018003",
        "hostel": "Jeendmata Wing - Sikar Campus",
        "room": "JW-109",
        "karmaPoints": 530,
        "badge": "GREEN CADET",
        "year": "1st Year B.Tech",
        "dept": "Mechanical Engineering"
      }
    ]
  },
  {
    "id": 9,
    "name": "Maharaja Surajmal Brij Univ",
    "shortName": "MSBU Bharatpur",
    "district": "Bharatpur",
    "districtCode": "BTP",
    "operatorUsername": "operator_bharatpur",
    "studentUsername": "student_bharatpur",
    "engineerName": "Er. Rohitash Saini",
    "engineerTitle": "Station SCADA Engineer",
    "badgeId": "OP-BTP-09",
    "sanctionedLoadKw": 220,
    "solarCapacityKw": 160,
    "windCapacityKw": 20,
    "batteryCapacityKwh": 80,
    "latitude": 27.2152,
    "longitude": 77.503,
    "isMajorHub": false,
    "hostels": [
      {
        "id": 25,
        "name": "Lohagarh Bhawan - MSBU Bharatpur",
        "residents": 145,
        "savedKwh": 1770,
        "karma": 960
      },
      {
        "id": 26,
        "name": "Keoladeo Eco Wing - MSBU Bharatpur",
        "residents": 160,
        "savedKwh": 1590,
        "karma": 860
      },
      {
        "id": 27,
        "name": "Surajmal Hall - Govt College Bharatpur",
        "residents": 130,
        "savedKwh": 1340,
        "karma": 740
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "Mohit Faujdar",
        "regNo": "24MSB901",
        "email": "mohit.faujdar@campus.tejas.edu",
        "phone": "+91 94140 19001",
        "cleanPhone": "919414019001",
        "hostel": "Lohagarh Bhawan - MSBU Bharatpur",
        "room": "LH-105",
        "karmaPoints": 960,
        "badge": "ENERGY CHAMPION",
        "year": "3rd Year B.Tech",
        "dept": "Civil Engineering"
      },
      {
        "id": 2,
        "name": "Renu Sinsinwar",
        "regNo": "24MSB902",
        "email": "renu.sinsinwar@campus.tejas.edu",
        "phone": "+91 94140 19002",
        "cleanPhone": "919414019002",
        "hostel": "Keoladeo Eco Wing - MSBU Bharatpur",
        "room": "KE-202",
        "karmaPoints": 740,
        "badge": "SOLAR GUARDIAN",
        "year": "2nd Year B.Sc",
        "dept": "Applied Sciences"
      },
      {
        "id": 3,
        "name": "Kapil Sharma",
        "regNo": "24MSB903",
        "email": "kapil.sharma@campus.tejas.edu",
        "phone": "+91 94140 19003",
        "cleanPhone": "919414019003",
        "hostel": "Surajmal Hall - Govt College Bharatpur",
        "room": "SM-310",
        "karmaPoints": 510,
        "badge": "GREEN CADET",
        "year": "1st Year B.Tech",
        "dept": "Electrical Engineering"
      }
    ]
  },
  {
    "id": 10,
    "name": "Govind Guru Tribal Univ (GGTU)",
    "shortName": "GGTU Banswara",
    "district": "Banswara",
    "districtCode": "BSW",
    "operatorUsername": "operator_banswara",
    "studentUsername": "student_banswara",
    "engineerName": "Er. Kamlesh Ninama",
    "engineerTitle": "Station SCADA Engineer",
    "badgeId": "OP-BSW-10",
    "sanctionedLoadKw": 200,
    "solarCapacityKw": 150,
    "windCapacityKw": 25,
    "batteryCapacityKwh": 80,
    "latitude": 23.5461,
    "longitude": 74.4373,
    "isMajorHub": false,
    "hostels": [
      {
        "id": 28,
        "name": "Mahi Dam Residency - GGTU Banswara",
        "residents": 130,
        "savedKwh": 1710,
        "karma": 930
      },
      {
        "id": 29,
        "name": "Vagad Tribal Bhawan - GGTU Banswara",
        "residents": 150,
        "savedKwh": 1540,
        "karma": 840
      },
      {
        "id": 30,
        "name": "Tripura Sundari Hall - GGTU Banswara",
        "residents": 120,
        "savedKwh": 1290,
        "karma": 710
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "Rameshwar Damor",
        "regNo": "24GGT1001",
        "email": "rameshwar.damor@campus.tejas.edu",
        "phone": "+91 94140 20001",
        "cleanPhone": "919414020001",
        "hostel": "Mahi Dam Residency - GGTU Banswara",
        "room": "MD-201",
        "karmaPoints": 930,
        "badge": "ENERGY CHAMPION",
        "year": "3rd Year B.Tech",
        "dept": "Tribal Renewable Tech"
      },
      {
        "id": 2,
        "name": "Anita Maida",
        "regNo": "24GGT1002",
        "email": "anita.maida@campus.tejas.edu",
        "phone": "+91 94140 20002",
        "cleanPhone": "919414020002",
        "hostel": "Vagad Tribal Bhawan - GGTU Banswara",
        "room": "VT-104",
        "karmaPoints": 710,
        "badge": "SOLAR GUARDIAN",
        "year": "2nd Year B.Tech",
        "dept": "Computer Science"
      },
      {
        "id": 3,
        "name": "Suresh Ninama",
        "regNo": "24GGT1003",
        "email": "suresh.ninama@campus.tejas.edu",
        "phone": "+91 94140 20003",
        "cleanPhone": "919414020003",
        "hostel": "Tripura Sundari Hall - GGTU Banswara",
        "room": "TS-305",
        "karmaPoints": 490,
        "badge": "GREEN CADET",
        "year": "1st Year B.Tech",
        "dept": "Solar Energy Tech"
      }
    ]
  },
  {
    "id": 11,
    "name": "MLV Textile & Engineering College",
    "shortName": "MLVTEC Bhilwara",
    "district": "Bhilwara",
    "districtCode": "BHL",
    "operatorUsername": "operator_bhilwara",
    "studentUsername": "student_bhilwara",
    "engineerName": "Er. Alok Maheshwari",
    "engineerTitle": "Station SCADA Engineer",
    "badgeId": "OP-BHL-11",
    "sanctionedLoadKw": 350,
    "solarCapacityKw": 240,
    "windCapacityKw": 30,
    "batteryCapacityKwh": 120,
    "latitude": 25.3216,
    "longitude": 74.6413,
    "isMajorHub": false,
    "hostels": [
      {
        "id": 31,
        "name": "Cotton Blossom Bhawan - MLV Bhilwara",
        "residents": 165,
        "savedKwh": 1980,
        "karma": 1070
      },
      {
        "id": 32,
        "name": "Harni Mahadev Hall - MLV Bhilwara",
        "residents": 180,
        "savedKwh": 1740,
        "karma": 940
      },
      {
        "id": 33,
        "name": "Textile Tech Wing - MLV Bhilwara",
        "residents": 140,
        "savedKwh": 1470,
        "karma": 810
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "Prateek Somani",
        "regNo": "24MLV1101",
        "email": "prateek.somani@campus.tejas.edu",
        "phone": "+91 94140 21001",
        "cleanPhone": "919414021001",
        "hostel": "Cotton Blossom Bhawan - MLV Bhilwara",
        "room": "CB-304",
        "karmaPoints": 1070,
        "badge": "ENERGY CHAMPION",
        "year": "3rd Year B.Tech",
        "dept": "Textile Engineering"
      },
      {
        "id": 2,
        "name": "Anjali Rathi",
        "regNo": "24MLV1102",
        "email": "anjali.rathi@campus.tejas.edu",
        "phone": "+91 94140 21002",
        "cleanPhone": "919414021002",
        "hostel": "Harni Mahadev Hall - MLV Bhilwara",
        "room": "HM-201",
        "karmaPoints": 830,
        "badge": "SOLAR GUARDIAN",
        "year": "2nd Year B.Tech",
        "dept": "Electrical Engineering"
      },
      {
        "id": 3,
        "name": "Yash Toshniwal",
        "regNo": "24MLV1103",
        "email": "yash.toshniwal@campus.tejas.edu",
        "phone": "+91 94140 21003",
        "cleanPhone": "919414021003",
        "hostel": "Textile Tech Wing - MLV Bhilwara",
        "room": "TT-106",
        "karmaPoints": 570,
        "badge": "GREEN CADET",
        "year": "1st Year B.Tech",
        "dept": "Mechanical Engineering"
      }
    ]
  },
  {
    "id": 12,
    "name": "Government Lohia College",
    "shortName": "Govt Lohia Churu",
    "district": "Churu",
    "districtCode": "CHU",
    "operatorUsername": "operator_churu",
    "studentUsername": "student_churu",
    "engineerName": "Er. Pawan Kaswan",
    "engineerTitle": "Station SCADA Engineer",
    "badgeId": "OP-CHU-12",
    "sanctionedLoadKw": 220,
    "solarCapacityKw": 170,
    "windCapacityKw": 30,
    "batteryCapacityKwh": 80,
    "latitude": 28.29,
    "longitude": 74.96,
    "isMajorHub": false,
    "hostels": [
      {
        "id": 34,
        "name": "Seth Lohia Bhawan - Churu College",
        "residents": 135,
        "savedKwh": 1690,
        "karma": 910
      },
      {
        "id": 35,
        "name": "Tal Chhapar Eco Wing - Lohia Churu",
        "residents": 150,
        "savedKwh": 1510,
        "karma": 820
      },
      {
        "id": 36,
        "name": "Dudhwa Khara Hall - Lohia Churu",
        "residents": 125,
        "savedKwh": 1280,
        "karma": 700
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "Devendra Saran",
        "regNo": "24GLC1201",
        "email": "devendra.saran@campus.tejas.edu",
        "phone": "+91 94140 22001",
        "cleanPhone": "919414022001",
        "hostel": "Seth Lohia Bhawan - Churu College",
        "room": "SL-202",
        "karmaPoints": 910,
        "badge": "ENERGY CHAMPION",
        "year": "3rd Year B.Sc",
        "dept": "Applied Mathematics"
      },
      {
        "id": 2,
        "name": "Sunita Kaswan",
        "regNo": "24GLC1202",
        "email": "sunita.kaswan@campus.tejas.edu",
        "phone": "+91 94140 22002",
        "cleanPhone": "919414022002",
        "hostel": "Tal Chhapar Eco Wing - Lohia Churu",
        "room": "TC-105",
        "karmaPoints": 690,
        "badge": "SOLAR GUARDIAN",
        "year": "2nd Year B.Com",
        "dept": "Commerce & Accounting"
      },
      {
        "id": 3,
        "name": "Amit Poonia",
        "regNo": "24GLC1203",
        "email": "amit.poonia@campus.tejas.edu",
        "phone": "+91 94140 22003",
        "cleanPhone": "919414022003",
        "hostel": "Dudhwa Khara Hall - Lohia Churu",
        "room": "DK-301",
        "karmaPoints": 480,
        "badge": "GREEN CADET",
        "year": "1st Year B.Sc",
        "dept": "Physics"
      }
    ]
  },
  {
    "id": 13,
    "name": "Govt PG College / Medical Campus",
    "shortName": "Govt College Jhalawar",
    "district": "Jhalawar",
    "districtCode": "JHL",
    "operatorUsername": "operator_jhalawar",
    "studentUsername": "student_jhalawar",
    "engineerName": "Er. Hemant Patidar",
    "engineerTitle": "Station SCADA Engineer",
    "badgeId": "OP-JHL-13",
    "sanctionedLoadKw": 240,
    "solarCapacityKw": 160,
    "windCapacityKw": 25,
    "batteryCapacityKwh": 90,
    "latitude": 24.5973,
    "longitude": 76.161,
    "isMajorHub": false,
    "hostels": [
      {
        "id": 37,
        "name": "Gagron Fort Bhawan - Jhalawar Campus",
        "residents": 140,
        "savedKwh": 1750,
        "karma": 950
      },
      {
        "id": 38,
        "name": "Chandrabhaga Hall - Jhalawar College",
        "residents": 155,
        "savedKwh": 1560,
        "karma": 850
      },
      {
        "id": 39,
        "name": "Jhalrapatan Wing - Jhalawar Campus",
        "residents": 120,
        "savedKwh": 1310,
        "karma": 720
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "Gaurav Patidar",
        "regNo": "24GPJ1301",
        "email": "gaurav.patidar@campus.tejas.edu",
        "phone": "+91 94140 23001",
        "cleanPhone": "919414023001",
        "hostel": "Gagron Fort Bhawan - Jhalawar Campus",
        "room": "GF-203",
        "karmaPoints": 950,
        "badge": "ENERGY CHAMPION",
        "year": "3rd Year B.Sc",
        "dept": "Horticultural Sciences"
      },
      {
        "id": 2,
        "name": "Pooja Nagar",
        "regNo": "24GPJ1302",
        "email": "pooja.nagar@campus.tejas.edu",
        "phone": "+91 94140 23002",
        "cleanPhone": "919414023002",
        "hostel": "Chandrabhaga Hall - Jhalawar College",
        "room": "CH-306",
        "karmaPoints": 730,
        "badge": "SOLAR GUARDIAN",
        "year": "2nd Year B.A",
        "dept": "Economics"
      },
      {
        "id": 3,
        "name": "Manish Dangi",
        "regNo": "24GPJ1303",
        "email": "manish.dangi@campus.tejas.edu",
        "phone": "+91 94140 23003",
        "cleanPhone": "919414023003",
        "hostel": "Jhalrapatan Wing - Jhalawar Campus",
        "room": "JP-102",
        "karmaPoints": 500,
        "badge": "GREEN CADET",
        "year": "1st Year B.Sc",
        "dept": "Chemistry"
      }
    ]
  },
  {
    "id": 14,
    "name": "Govt National College",
    "shortName": "Govt College Ganganagar",
    "district": "Sri Ganganagar",
    "districtCode": "SGN",
    "operatorUsername": "operator_ganganagar",
    "studentUsername": "student_ganganagar",
    "engineerName": "Er. Gurmeet Singh",
    "engineerTitle": "Station SCADA Engineer",
    "badgeId": "OP-SGN-14",
    "sanctionedLoadKw": 260,
    "solarCapacityKw": 180,
    "windCapacityKw": 35,
    "batteryCapacityKwh": 100,
    "latitude": 29.909,
    "longitude": 73.88,
    "isMajorHub": false,
    "hostels": [
      {
        "id": 40,
        "name": "Gang Canal Bhawan - National Ganganagar",
        "residents": 150,
        "savedKwh": 1860,
        "karma": 1010
      },
      {
        "id": 41,
        "name": "Green Valley Hall - Ganganagar College",
        "residents": 165,
        "savedKwh": 1620,
        "karma": 880
      },
      {
        "id": 42,
        "name": "Suratgarh Energy Wing - Ganganagar",
        "residents": 130,
        "savedKwh": 1380,
        "karma": 750
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "Jashanpreet Singh",
        "regNo": "24GNC1401",
        "email": "jashanpreet.singh@campus.tejas.edu",
        "phone": "+91 94140 24001",
        "cleanPhone": "919414024001",
        "hostel": "Gang Canal Bhawan - National Ganganagar",
        "room": "GC-301",
        "karmaPoints": 1010,
        "badge": "ENERGY CHAMPION",
        "year": "3rd Year B.Tech",
        "dept": "Agricultural Engineering"
      },
      {
        "id": 2,
        "name": "Simranjeet Kaur",
        "regNo": "24GNC1402",
        "email": "simranjeet.kaur@campus.tejas.edu",
        "phone": "+91 94140 24002",
        "cleanPhone": "919414024002",
        "hostel": "Green Valley Hall - Ganganagar College",
        "room": "GV-204",
        "karmaPoints": 780,
        "badge": "SOLAR GUARDIAN",
        "year": "2nd Year B.Sc",
        "dept": "Botany"
      },
      {
        "id": 3,
        "name": "Gurpreet Brar",
        "regNo": "24GNC1403",
        "email": "gurpreet.brar@campus.tejas.edu",
        "phone": "+91 94140 24003",
        "cleanPhone": "919414024003",
        "hostel": "Suratgarh Energy Wing - Ganganagar",
        "room": "SE-108",
        "karmaPoints": 520,
        "badge": "GREEN CADET",
        "year": "1st Year B.A",
        "dept": "Political Science"
      }
    ]
  },
  {
    "id": 15,
    "name": "Govt PG College Chittorgarh",
    "shortName": "Govt College Chittor",
    "district": "Chittorgarh",
    "districtCode": "COR",
    "operatorUsername": "operator_chittorgarh",
    "studentUsername": "student_chittorgarh",
    "engineerName": "Er. Bhanwar Singh",
    "engineerTitle": "Station SCADA Engineer",
    "badgeId": "OP-COR-15",
    "sanctionedLoadKw": 250,
    "solarCapacityKw": 170,
    "windCapacityKw": 30,
    "batteryCapacityKwh": 90,
    "latitude": 24.8887,
    "longitude": 74.6269,
    "isMajorHub": false,
    "hostels": [
      {
        "id": 43,
        "name": "Padmini Bhawan - Chittorgarh Campus",
        "residents": 145,
        "savedKwh": 1810,
        "karma": 980
      },
      {
        "id": 44,
        "name": "Vijay Stambh Hall - Chittorgarh PG",
        "residents": 160,
        "savedKwh": 1600,
        "karma": 870
      },
      {
        "id": 45,
        "name": "Rana Kumbha Wing - Chittorgarh College",
        "residents": 130,
        "savedKwh": 1350,
        "karma": 740
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "Digvijay Jhala",
        "regNo": "24GPC1501",
        "email": "digvijay.jhala@campus.tejas.edu",
        "phone": "+91 94140 25001",
        "cleanPhone": "919414025001",
        "hostel": "Padmini Bhawan - Chittorgarh Campus",
        "room": "PB-205",
        "karmaPoints": 980,
        "badge": "ENERGY CHAMPION",
        "year": "3rd Year B.Sc",
        "dept": "Geology"
      },
      {
        "id": 2,
        "name": "Komal Chundawat",
        "regNo": "24GPC1502",
        "email": "komal.chundawat@campus.tejas.edu",
        "phone": "+91 94140 25002",
        "cleanPhone": "919414025002",
        "hostel": "Vijay Stambh Hall - Chittorgarh PG",
        "room": "VS-302",
        "karmaPoints": 750,
        "badge": "SOLAR GUARDIAN",
        "year": "2nd Year B.Com",
        "dept": "Banking & Finance"
      },
      {
        "id": 3,
        "name": "Rajendra Shaktawat",
        "regNo": "24GPC1503",
        "email": "rajendra.shaktawat@campus.tejas.edu",
        "phone": "+91 94140 25003",
        "cleanPhone": "919414025003",
        "hostel": "Rana Kumbha Wing - Chittorgarh College",
        "room": "RK-104",
        "karmaPoints": 510,
        "badge": "GREEN CADET",
        "year": "1st Year B.A",
        "dept": "History"
      }
    ]
  },
  {
    "id": 16,
    "name": "Seth Motilal Govt College",
    "shortName": "Motilal College Jhunjhunu",
    "district": "Jhunjhunu",
    "districtCode": "JJN",
    "operatorUsername": "operator_jhunjhunu",
    "studentUsername": "student_jhunjhunu",
    "engineerName": "Er. Anil Shekhawat",
    "engineerTitle": "Station SCADA Engineer",
    "badgeId": "OP-JJN-16",
    "sanctionedLoadKw": 230,
    "solarCapacityKw": 150,
    "windCapacityKw": 25,
    "batteryCapacityKwh": 80,
    "latitude": 28.1289,
    "longitude": 75.3995,
    "isMajorHub": false,
    "hostels": [
      {
        "id": 46,
        "name": "Motilal Heritage Bhawan - Jhunjhunu",
        "residents": 135,
        "savedKwh": 1720,
        "karma": 930
      },
      {
        "id": 47,
        "name": "Khetri Copper Hall - Jhunjhunu College",
        "residents": 150,
        "savedKwh": 1530,
        "karma": 830
      },
      {
        "id": 48,
        "name": "Rani Sati Wing - Jhunjhunu Campus",
        "residents": 120,
        "savedKwh": 1270,
        "karma": 690
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "Naveen Sheoran",
        "regNo": "24SMJ1601",
        "email": "naveen.sheoran@campus.tejas.edu",
        "phone": "+91 94140 26001",
        "cleanPhone": "919414026001",
        "hostel": "Motilal Heritage Bhawan - Jhunjhunu",
        "room": "MH-202",
        "karmaPoints": 930,
        "badge": "ENERGY CHAMPION",
        "year": "3rd Year B.Tech",
        "dept": "Electronics Engineering"
      },
      {
        "id": 2,
        "name": "Manisha Kadian",
        "regNo": "24SMJ1602",
        "email": "manisha.kadian@campus.tejas.edu",
        "phone": "+91 94140 26002",
        "cleanPhone": "919414026002",
        "hostel": "Khetri Copper Hall - Jhunjhunu College",
        "room": "KC-106",
        "karmaPoints": 710,
        "badge": "SOLAR GUARDIAN",
        "year": "2nd Year B.Sc",
        "dept": "Mathematics"
      },
      {
        "id": 3,
        "name": "Sandeep Pilania",
        "regNo": "24SMJ1603",
        "email": "sandeep.pilania@campus.tejas.edu",
        "phone": "+91 94140 26003",
        "cleanPhone": "919414026003",
        "hostel": "Rani Sati Wing - Jhunjhunu Campus",
        "room": "RS-304",
        "karmaPoints": 490,
        "badge": "GREEN CADET",
        "year": "1st Year B.Com",
        "dept": "Commerce"
      }
    ]
  },
  {
    "id": 17,
    "name": "Bangur Govt College",
    "shortName": "Bangur College Pali",
    "district": "Pali",
    "districtCode": "PLI",
    "operatorUsername": "operator_pali",
    "studentUsername": "student_pali",
    "engineerName": "Er. Surendra Choudhary",
    "engineerTitle": "Station SCADA Engineer",
    "badgeId": "OP-PLI-17",
    "sanctionedLoadKw": 240,
    "solarCapacityKw": 170,
    "windCapacityKw": 30,
    "batteryCapacityKwh": 90,
    "latitude": 25.7711,
    "longitude": 73.3234,
    "isMajorHub": false,
    "hostels": [
      {
        "id": 49,
        "name": "Bangur Heritage Bhawan - Pali College",
        "residents": 140,
        "savedKwh": 1760,
        "karma": 960
      },
      {
        "id": 50,
        "name": "Jawai Eco Hall - Pali Campus",
        "residents": 155,
        "savedKwh": 1570,
        "karma": 850
      },
      {
        "id": 51,
        "name": "Ranakpur Wing - Pali College",
        "residents": 125,
        "savedKwh": 1320,
        "karma": 720
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "Mayank Sirvi",
        "regNo": "24BGC1701",
        "email": "mayank.sirvi@campus.tejas.edu",
        "phone": "+91 94140 27001",
        "cleanPhone": "919414027001",
        "hostel": "Bangur Heritage Bhawan - Pali College",
        "room": "BH-303",
        "karmaPoints": 960,
        "badge": "ENERGY CHAMPION",
        "year": "3rd Year B.Tech",
        "dept": "Textile Technology"
      },
      {
        "id": 2,
        "name": "Varsha Deora",
        "regNo": "24BGC1702",
        "email": "varsha.deora@campus.tejas.edu",
        "phone": "+91 94140 27002",
        "cleanPhone": "919414027002",
        "hostel": "Jawai Eco Hall - Pali Campus",
        "room": "JE-201",
        "karmaPoints": 740,
        "badge": "SOLAR GUARDIAN",
        "year": "2nd Year B.Sc",
        "dept": "Chemistry"
      },
      {
        "id": 3,
        "name": "Chetan Gehlot",
        "regNo": "24BGC1703",
        "email": "chetan.gehlot@campus.tejas.edu",
        "phone": "+91 94140 27003",
        "cleanPhone": "919414027003",
        "hostel": "Ranakpur Wing - Pali College",
        "room": "RW-107",
        "karmaPoints": 520,
        "badge": "GREEN CADET",
        "year": "1st Year B.A",
        "dept": "Economics"
      }
    ]
  },
  {
    "id": 18,
    "name": "Govt B.R. Mirdha College",
    "shortName": "Mirdha College Nagaur",
    "district": "Nagaur",
    "districtCode": "NGR",
    "operatorUsername": "operator_nagaur",
    "studentUsername": "student_nagaur",
    "engineerName": "Er. Ramdev Mirdha",
    "engineerTitle": "Station SCADA Engineer",
    "badgeId": "OP-NGR-18",
    "sanctionedLoadKw": 250,
    "solarCapacityKw": 190,
    "windCapacityKw": 35,
    "batteryCapacityKwh": 100,
    "latitude": 27.2,
    "longitude": 73.74,
    "isMajorHub": false,
    "hostels": [
      {
        "id": 52,
        "name": "Baldev Ram Mirdha Bhawan - Nagaur",
        "residents": 145,
        "savedKwh": 1790,
        "karma": 970
      },
      {
        "id": 53,
        "name": "Ahichhatragarh Hall - Nagaur Campus",
        "residents": 160,
        "savedKwh": 1580,
        "karma": 860
      },
      {
        "id": 54,
        "name": "Kharnal Wing - Mirdha Nagaur",
        "residents": 125,
        "savedKwh": 1300,
        "karma": 710
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "Hanuman Ram Godara",
        "regNo": "24BRM1801",
        "email": "hanuman.godara@campus.tejas.edu",
        "phone": "+91 94140 28001",
        "cleanPhone": "919414028001",
        "hostel": "Baldev Ram Mirdha Bhawan - Nagaur",
        "room": "BM-204",
        "karmaPoints": 970,
        "badge": "ENERGY CHAMPION",
        "year": "3rd Year B.Tech",
        "dept": "Agricultural Machinery"
      },
      {
        "id": 2,
        "name": "Saroj Khileri",
        "regNo": "24BRM1802",
        "email": "saroj.khileri@campus.tejas.edu",
        "phone": "+91 94140 28002",
        "cleanPhone": "919414028002",
        "hostel": "Ahichhatragarh Hall - Nagaur Campus",
        "room": "AG-305",
        "karmaPoints": 750,
        "badge": "SOLAR GUARDIAN",
        "year": "2nd Year B.Sc",
        "dept": "Physics"
      },
      {
        "id": 3,
        "name": "Mukesh Beniwal",
        "regNo": "24BRM1803",
        "email": "mukesh.beniwal@campus.tejas.edu",
        "phone": "+91 94140 28003",
        "cleanPhone": "919414028003",
        "hostel": "Kharnal Wing - Mirdha Nagaur",
        "room": "KW-101",
        "karmaPoints": 510,
        "badge": "GREEN CADET",
        "year": "1st Year B.Com",
        "dept": "Accountancy"
      }
    ]
  },
  {
    "id": 19,
    "name": "Govt Nehru Memorial PG College",
    "shortName": "Nehru College Hanumangarh",
    "district": "Hanumangarh",
    "districtCode": "HMH",
    "operatorUsername": "operator_hanumangarh",
    "studentUsername": "student_hanumangarh",
    "engineerName": "Er. Jagjit Brar",
    "engineerTitle": "Station SCADA Engineer",
    "badgeId": "OP-HMH-19",
    "sanctionedLoadKw": 220,
    "solarCapacityKw": 140,
    "windCapacityKw": 25,
    "batteryCapacityKwh": 70,
    "latitude": 29.58,
    "longitude": 74.32,
    "isMajorHub": false,
    "hostels": [
      {
        "id": 55,
        "name": "Bhatner Fort Bhawan - Hanumangarh",
        "residents": 140,
        "savedKwh": 1740,
        "karma": 940
      },
      {
        "id": 56,
        "name": "Ghaggar Basin Hall - Nehru Hanumangarh",
        "residents": 155,
        "savedKwh": 1550,
        "karma": 840
      },
      {
        "id": 57,
        "name": "Kalibangan Wing - Hanumangarh PG",
        "residents": 125,
        "savedKwh": 1290,
        "karma": 700
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "Arshdeep Sidhu",
        "regNo": "24GNM1901",
        "email": "arshdeep.sidhu@campus.tejas.edu",
        "phone": "+91 94140 29001",
        "cleanPhone": "919414029001",
        "hostel": "Bhatner Fort Bhawan - Hanumangarh",
        "room": "BF-302",
        "karmaPoints": 940,
        "badge": "ENERGY CHAMPION",
        "year": "3rd Year B.Tech",
        "dept": "Irrigation & Power"
      },
      {
        "id": 2,
        "name": "Harleen Pannu",
        "regNo": "24GNM1902",
        "email": "harleen.pannu@campus.tejas.edu",
        "phone": "+91 94140 29002",
        "cleanPhone": "919414029002",
        "hostel": "Ghaggar Basin Hall - Nehru Hanumangarh",
        "room": "GB-203",
        "karmaPoints": 720,
        "badge": "SOLAR GUARDIAN",
        "year": "2nd Year B.Sc",
        "dept": "Microbiology"
      },
      {
        "id": 3,
        "name": "Sukhwinder Gill",
        "regNo": "24GNM1903",
        "email": "sukhwinder.gill@campus.tejas.edu",
        "phone": "+91 94140 29003",
        "cleanPhone": "919414029003",
        "hostel": "Kalibangan Wing - Hanumangarh PG",
        "room": "KB-108",
        "karmaPoints": 490,
        "badge": "GREEN CADET",
        "year": "1st Year B.A",
        "dept": "Geography"
      }
    ]
  },
  {
    "id": 20,
    "name": "Govt PG College Barmer",
    "shortName": "Govt College Barmer",
    "district": "Barmer",
    "districtCode": "BME",
    "operatorUsername": "operator_barmer",
    "studentUsername": "student_barmer",
    "engineerName": "Er. Tanwar Singh",
    "engineerTitle": "Station SCADA Engineer",
    "badgeId": "OP-BME-20",
    "sanctionedLoadKw": 280,
    "solarCapacityKw": 220,
    "windCapacityKw": 50,
    "batteryCapacityKwh": 110,
    "latitude": 25.7521,
    "longitude": 71.3967,
    "isMajorHub": true,
    "hostels": [
      {
        "id": 58,
        "name": "Thar Solar Bhawan - Barmer Campus",
        "residents": 150,
        "savedKwh": 2050,
        "karma": 1110
      },
      {
        "id": 59,
        "name": "Kiradu Heritage Hall - Barmer PG",
        "residents": 165,
        "savedKwh": 1790,
        "karma": 970
      },
      {
        "id": 60,
        "name": "Siwana Desert Wing - Barmer College",
        "residents": 135,
        "savedKwh": 1480,
        "karma": 800
      }
    ],
    "students": [
      {
        "id": 1,
        "name": "Joga Ram Meghwal",
        "regNo": "24GPB2001",
        "email": "joga.meghwal@campus.tejas.edu",
        "phone": "+91 94140 30001",
        "cleanPhone": "919414030001",
        "hostel": "Thar Solar Bhawan - Barmer Campus",
        "room": "TS-201",
        "karmaPoints": 1110,
        "badge": "ENERGY CHAMPION",
        "year": "3rd Year B.Tech",
        "dept": "Petroleum & Solar Systems"
      },
      {
        "id": 2,
        "name": "Chanda Rathore",
        "regNo": "24GPB2002",
        "email": "chanda.rathore@campus.tejas.edu",
        "phone": "+91 94140 30002",
        "cleanPhone": "919414030002",
        "hostel": "Kiradu Heritage Hall - Barmer PG",
        "room": "KH-304",
        "karmaPoints": 860,
        "badge": "SOLAR GUARDIAN",
        "year": "2nd Year B.Sc",
        "dept": "Geophysics"
      },
      {
        "id": 3,
        "name": "Jaswant Dudi",
        "regNo": "24GPB2003",
        "email": "jaswant.dudi@campus.tejas.edu",
        "phone": "+91 94140 30003",
        "cleanPhone": "919414030003",
        "hostel": "Siwana Desert Wing - Barmer College",
        "room": "SW-105",
        "karmaPoints": 610,
        "badge": "GREEN CADET",
        "year": "1st Year B.A",
        "dept": "Public Administration"
      }
    ]
  }
];

export function getCampusById(id) {
  const numericId = Number(id);
  return RAJASTHAN_CAMPUSES.find((c) => c.id === numericId) || RAJASTHAN_CAMPUSES[0];
}

export function getCampusByUsername(username) {
  if (!username) return RAJASTHAN_CAMPUSES[0];
  return RAJASTHAN_CAMPUSES.find((c) => c.operatorUsername === username || c.studentUsername === username) || RAJASTHAN_CAMPUSES[0];
}

export function getStudentsByCampusId(id) {
  const campus = getCampusById(id);
  return campus.students || [];
}

export function getHostelsByCampusId(id) {
  const campus = getCampusById(id);
  return campus.hostels || [];
}
