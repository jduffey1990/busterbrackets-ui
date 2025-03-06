// ui/src/utils/bracketStruc.js
export const bracketNames = {
  "fake": {
        // EAST (e1–e16)
        e1: "East Eagles",
        e2: "East Lions",
        e3: "East Huskies",
        e4: "East Bulldogs",
        e5: "East Warriors",
        e6: "East Cougars",
        e7: "East Tigers",
        e8: "East Bulls",
        e9: "East Owls",
        e10: "East Hawks",
        e11: "East Knights",
        e12: "East Cardinals",
        e13: "East Wolves",
        e14: "East Bears",
        e15: "East Spartans",
        e16: "East Gators",
      
        // WEST (w1–w16)
        w1: "West Eagles",
        w2: "West Lions",
        w3: "West Huskies",
        w4: "West Bulldogs",
        w5: "West Warriors",
        w6: "West Cougars",
        w7: "West Tigers",
        w8: "West Bulls",
        w9: "West Owls",
        w10: "West Hawks",
        w11: "West Knights",
        w12: "West Cardinals",
        w13: "West Wolves",
        w14: "West Bears",
        w15: "West Spartans",
        w16: "West Gators",
      
        // MIDWEST (m1–m16)
        m1: "Midwest Eagles",
        m2: "Midwest Lions",
        m3: "Midwest Huskies",
        m4: "Midwest Bulldogs",
        m5: "Midwest Warriors",
        m6: "Midwest Cougars",
        m7: "Midwest Tigers",
        m8: "Midwest Bulls",
        m9: "Midwest Owls",
        m10: "Midwest Hawks",
        m11: "Midwest Knights",
        m12: "Midwest Cardinals",
        m13: "Midwest Wolves",
        m14: "Midwest Bears",
        m15: "Midwest Spartans",
        m16: "Midwest Gators",
      
        // SOUTH (s1–s16)
        s1: "South Eagles",
        s2: "South Lions",
        s3: "South Huskies",
        s4: "South Bulldogs",
        s5: "South Warriors",
        s6: "South Cougars",
        s7: "South Tigers",
        s8: "South Bulls",
        s9: "South Owls",
        s10: "South Hawks",
        s11: "South Knights",
        s12: "South Cardinals",
        s13: "South Wolves",
        s14: "South Bears",
        s15: "South Spartans",
        s16: "South Gators",
      }
  };

  export const recordsOver20 = {
    //real odds
    "1vs16": "154-2",
    "8vs9": "75-81",
    "5vs12": "101-55",
    "4vs13": "123-33",
    "6vs11": "95-61",
    "3vs14": "133-23",
    "7vs10": "95-61",
    "2vs15": "145-11",
    "1vs8": "61-17",
    "4vs5": "47-36",
    "3vs6": "48-31",
    "2vs7": "63-27",
    "1vs4": "49-20",
    "2vs3": "37-24",
    "1vs2": "38-30",
    "1vs9": "74-6",
    "3vs11": "36-20",
    "1vs5": "43-11",
    "2vs11": "16-4",
    "5vs13": "18-3",
    "4vs12": "30-13",
    "1vs12": "20-0",
    "1vs3": "23-14",
    "2vs10": "36-19",
    "2vs6": "24-8",
    //even odds mocked
    "1vs1": "10-10",
    "2vs2": "10-10",
    "3vs3": "10-10",
    "4vs4": "10-10",
    "5vs5": "10-10",
    "6vs6": "10-10",
    "7vs7": "10-10",
    "8vs8": "10-10",
    "9vs9": "10-10",
    "10vs10": "10-10",
    "11vs11": "10-10",
    "12vs12": "10-10",
    "13vs13": "10-10",
    "14vs14": "10-10",
    "15vs15": "10-10",
    "16vs16": "10-10",
  };

  export const fixRecords = (obj) => {
    const records = new Map();
  
    for (const key in obj) {
      const [winsStr, lossesStr] = obj[key].split("-");
      const wins = parseFloat(winsStr);
      const losses = parseFloat(lossesStr);
      const total = wins + losses;
  
      // If there's no data or total is zero, skip or set to 0
      if (!total) {
        continue; // or records.set(key, 0) if you'd prefer
      }
  
      // Convert to an integer percentage
      const percentage = Math.round((wins / total) * 100);
  
      records.set(key, percentage);
    }
  
    return records;
  };
  
  