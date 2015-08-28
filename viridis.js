//Definition of viridis and other dictionaries. 

var viridis_cmap = [
   'rgb(0, 0, 0)'
   ,'rgb(68, 1, 84)'
   ,'rgb(68, 2, 86)'
   ,'rgb(69, 4, 87)'
   ,'rgb(69, 5, 89)'
   ,'rgb(70, 7, 90)'
   ,'rgb(70, 8, 92)'
   ,'rgb(70, 10, 93)'
   ,'rgb(70, 11, 94)'
   ,'rgb(71, 13, 96)'
   ,'rgb(71, 14, 97)'
   ,'rgb(71, 16, 99)'
   ,'rgb(71, 17, 100)'
   ,'rgb(71, 19, 101)'
   ,'rgb(72, 20, 103)'
   ,'rgb(72, 22, 104)'
   ,'rgb(72, 23, 105)'
   ,'rgb(72, 24, 106)'
   ,'rgb(72, 26, 108)'
   ,'rgb(72, 27, 109)'
   ,'rgb(72, 28, 110)'
   ,'rgb(72, 29, 111)'
   ,'rgb(72, 31, 112)'
   ,'rgb(72, 32, 113)'
   ,'rgb(72, 33, 115)'
   ,'rgb(72, 35, 116)'
   ,'rgb(72, 36, 117)'
   ,'rgb(72, 37, 118)'
   ,'rgb(72, 38, 119)'
   ,'rgb(72, 40, 120)'
   ,'rgb(72, 41, 121)'
   ,'rgb(71, 42, 122)'
   ,'rgb(71, 44, 122)'
   ,'rgb(71, 45, 123)'
   ,'rgb(71, 46, 124)'
   ,'rgb(71, 47, 125)'
   ,'rgb(70, 48, 126)'
   ,'rgb(70, 50, 126)'
   ,'rgb(70, 51, 127)'
   ,'rgb(70, 52, 128)'
   ,'rgb(69, 53, 129)'
   ,'rgb(69, 55, 129)'
   ,'rgb(69, 56, 130)'
   ,'rgb(68, 57, 131)'
   ,'rgb(68, 58, 131)'
   ,'rgb(68, 59, 132)'
   ,'rgb(67, 61, 132)'
   ,'rgb(67, 62, 133)'
   ,'rgb(66, 63, 133)'
   ,'rgb(66, 64, 134)'
   ,'rgb(66, 65, 134)'
   ,'rgb(65, 66, 135)'
   ,'rgb(65, 68, 135)'
   ,'rgb(64, 69, 136)'
   ,'rgb(64, 70, 136)'
   ,'rgb(63, 71, 136)'
   ,'rgb(63, 72, 137)'
   ,'rgb(62, 73, 137)'
   ,'rgb(62, 74, 137)'
   ,'rgb(62, 76, 138)'
   ,'rgb(61, 77, 138)'
   ,'rgb(61, 78, 138)'
   ,'rgb(60, 79, 138)'
   ,'rgb(60, 80, 139)'
   ,'rgb(59, 81, 139)'
   ,'rgb(59, 82, 139)'
   ,'rgb(58, 83, 139)'
   ,'rgb(58, 84, 140)'
   ,'rgb(57, 85, 140)'
   ,'rgb(57, 86, 140)'
   ,'rgb(56, 88, 140)'
   ,'rgb(56, 89, 140)'
   ,'rgb(55, 90, 140)'
   ,'rgb(55, 91, 141)'
   ,'rgb(54, 92, 141)'
   ,'rgb(54, 93, 141)'
   ,'rgb(53, 94, 141)'
   ,'rgb(53, 95, 141)'
   ,'rgb(52, 96, 141)'
   ,'rgb(52, 97, 141)'
   ,'rgb(51, 98, 141)'
   ,'rgb(51, 99, 141)'
   ,'rgb(50, 100, 142)'
   ,'rgb(50, 101, 142)'
   ,'rgb(49, 102, 142)'
   ,'rgb(49, 103, 142)'
   ,'rgb(49, 104, 142)'
   ,'rgb(48, 105, 142)'
   ,'rgb(48, 106, 142)'
   ,'rgb(47, 107, 142)'
   ,'rgb(47, 108, 142)'
   ,'rgb(46, 109, 142)'
   ,'rgb(46, 110, 142)'
   ,'rgb(46, 111, 142)'
   ,'rgb(45, 112, 142)'
   ,'rgb(45, 113, 142)'
   ,'rgb(44, 113, 142)'
   ,'rgb(44, 114, 142)'
   ,'rgb(44, 115, 142)'
   ,'rgb(43, 116, 142)'
   ,'rgb(43, 117, 142)'
   ,'rgb(42, 118, 142)'
   ,'rgb(42, 119, 142)'
   ,'rgb(42, 120, 142)'
   ,'rgb(41, 121, 142)'
   ,'rgb(41, 122, 142)'
   ,'rgb(41, 123, 142)'
   ,'rgb(40, 124, 142)'
   ,'rgb(40, 125, 142)'
   ,'rgb(39, 126, 142)'
   ,'rgb(39, 127, 142)'
   ,'rgb(39, 128, 142)'
   ,'rgb(38, 129, 142)'
   ,'rgb(38, 130, 142)'
   ,'rgb(38, 130, 142)'
   ,'rgb(37, 131, 142)'
   ,'rgb(37, 132, 142)'
   ,'rgb(37, 133, 142)'
   ,'rgb(36, 134, 142)'
   ,'rgb(36, 135, 142)'
   ,'rgb(35, 136, 142)'
   ,'rgb(35, 137, 142)'
   ,'rgb(35, 138, 141)'
   ,'rgb(34, 139, 141)'
   ,'rgb(34, 140, 141)'
   ,'rgb(34, 141, 141)'
   ,'rgb(33, 142, 141)'
   ,'rgb(33, 143, 141)'
   ,'rgb(33, 144, 141)'
   ,'rgb(33, 145, 140)'
   ,'rgb(32, 146, 140)'
   ,'rgb(32, 146, 140)'
   ,'rgb(32, 147, 140)'
   ,'rgb(31, 148, 140)'
   ,'rgb(31, 149, 139)'
   ,'rgb(31, 150, 139)'
   ,'rgb(31, 151, 139)'
   ,'rgb(31, 152, 139)'
   ,'rgb(31, 153, 138)'
   ,'rgb(31, 154, 138)'
   ,'rgb(30, 155, 138)'
   ,'rgb(30, 156, 137)'
   ,'rgb(30, 157, 137)'
   ,'rgb(31, 158, 137)'
   ,'rgb(31, 159, 136)'
   ,'rgb(31, 160, 136)'
   ,'rgb(31, 161, 136)'
   ,'rgb(31, 161, 135)'
   ,'rgb(31, 162, 135)'
   ,'rgb(32, 163, 134)'
   ,'rgb(32, 164, 134)'
   ,'rgb(33, 165, 133)'
   ,'rgb(33, 166, 133)'
   ,'rgb(34, 167, 133)'
   ,'rgb(34, 168, 132)'
   ,'rgb(35, 169, 131)'
   ,'rgb(36, 170, 131)'
   ,'rgb(37, 171, 130)'
   ,'rgb(37, 172, 130)'
   ,'rgb(38, 173, 129)'
   ,'rgb(39, 173, 129)'
   ,'rgb(40, 174, 128)'
   ,'rgb(41, 175, 127)'
   ,'rgb(42, 176, 127)'
   ,'rgb(44, 177, 126)'
   ,'rgb(45, 178, 125)'
   ,'rgb(46, 179, 124)'
   ,'rgb(47, 180, 124)'
   ,'rgb(49, 181, 123)'
   ,'rgb(50, 182, 122)'
   ,'rgb(52, 182, 121)'
   ,'rgb(53, 183, 121)'
   ,'rgb(55, 184, 120)'
   ,'rgb(56, 185, 119)'
   ,'rgb(58, 186, 118)'
   ,'rgb(59, 187, 117)'
   ,'rgb(61, 188, 116)'
   ,'rgb(63, 188, 115)'
   ,'rgb(64, 189, 114)'
   ,'rgb(66, 190, 113)'
   ,'rgb(68, 191, 112)'
   ,'rgb(70, 192, 111)'
   ,'rgb(72, 193, 110)'
   ,'rgb(74, 193, 109)'
   ,'rgb(76, 194, 108)'
   ,'rgb(78, 195, 107)'
   ,'rgb(80, 196, 106)'
   ,'rgb(82, 197, 105)'
   ,'rgb(84, 197, 104)'
   ,'rgb(86, 198, 103)'
   ,'rgb(88, 199, 101)'
   ,'rgb(90, 200, 100)'
   ,'rgb(92, 200, 99)'
   ,'rgb(94, 201, 98)'
   ,'rgb(96, 202, 96)'
   ,'rgb(99, 203, 95)'
   ,'rgb(101, 203, 94)'
   ,'rgb(103, 204, 92)'
   ,'rgb(105, 205, 91)'
   ,'rgb(108, 205, 90)'
   ,'rgb(110, 206, 88)'
   ,'rgb(112, 207, 87)'
   ,'rgb(115, 208, 86)'
   ,'rgb(117, 208, 84)'
   ,'rgb(119, 209, 83)'
   ,'rgb(122, 209, 81)'
   ,'rgb(124, 210, 80)'
   ,'rgb(127, 211, 78)'
   ,'rgb(129, 211, 77)'
   ,'rgb(132, 212, 75)'
   ,'rgb(134, 213, 73)'
   ,'rgb(137, 213, 72)'
   ,'rgb(139, 214, 70)'
   ,'rgb(142, 214, 69)'
   ,'rgb(144, 215, 67)'
   ,'rgb(147, 215, 65)'
   ,'rgb(149, 216, 64)'
   ,'rgb(152, 216, 62)'
   ,'rgb(155, 217, 60)'
   ,'rgb(157, 217, 59)'
   ,'rgb(160, 218, 57)'
   ,'rgb(162, 218, 55)'
   ,'rgb(165, 219, 54)'
   ,'rgb(168, 219, 52)'
   ,'rgb(170, 220, 50)'
   ,'rgb(173, 220, 48)'
   ,'rgb(176, 221, 47)'
   ,'rgb(178, 221, 45)'
   ,'rgb(181, 222, 43)'
   ,'rgb(184, 222, 41)'
   ,'rgb(186, 222, 40)'
   ,'rgb(189, 223, 38)'
   ,'rgb(192, 223, 37)'
   ,'rgb(194, 223, 35)'
   ,'rgb(197, 224, 33)'
   ,'rgb(200, 224, 32)'
   ,'rgb(202, 225, 31)'
   ,'rgb(205, 225, 29)'
   ,'rgb(208, 225, 28)'
   ,'rgb(210, 226, 27)'
   ,'rgb(213, 226, 26)'
   ,'rgb(216, 226, 25)'
   ,'rgb(218, 227, 25)'
   ,'rgb(221, 227, 24)'
   ,'rgb(223, 227, 24)'
   ,'rgb(226, 228, 24)'
   ,'rgb(229, 228, 25)'
   ,'rgb(231, 228, 25)'
   ,'rgb(234, 229, 26)'
   ,'rgb(236, 229, 27)'
   ,'rgb(239, 229, 28)'
   ,'rgb(241, 229, 29)'
   ,'rgb(244, 230, 30)'
   ,'rgb(246, 230, 32)'
   ,'rgb(248, 230, 33)'
   ,'rgb(251, 231, 35)'
   ,'rgb(253, 231, 37)'
];

var rainbow = [
  'rgb(0, 0, 0)'
  ,'rgb(0, 64, 0)'
  ,'rgb(0, 68, 5)'
  ,'rgb(0, 72, 10)'
  ,'rgb(0, 75, 15)'
  ,'rgb(0, 79, 20)'
  ,'rgb(0, 83, 26)'
  ,'rgb(0, 87, 31)'
  ,'rgb(0, 91, 36)'
  ,'rgb(0, 95, 41)'
  ,'rgb(0, 98, 46)'
  ,'rgb(0, 102, 51)'
  ,'rgb(0, 106, 56)'
  ,'rgb(0, 110, 61)'
  ,'rgb(0, 114, 66)'
  ,'rgb(0, 117, 71)'
  ,'rgb(0, 121, 77)'
  ,'rgb(0, 125, 82)'
  ,'rgb(0, 129, 87)'
  ,'rgb(0, 133, 92)'
  ,'rgb(0, 137, 97)'
  ,'rgb(0, 140, 102)'
  ,'rgb(0, 144, 107)'
  ,'rgb(0, 148, 112)'
  ,'rgb(0, 152, 117)'
  ,'rgb(0, 156, 122)'
  ,'rgb(0, 160, 128)'
  ,'rgb(0, 163, 133)'
  ,'rgb(0, 167, 138)'
  ,'rgb(0, 171, 143)'
  ,'rgb(0, 175, 148)'
  ,'rgb(0, 179, 153)'
  ,'rgb(0, 182, 158)'
  ,'rgb(0, 186, 163)'
  ,'rgb(0, 190, 168)'
  ,'rgb(0, 194, 173)'
  ,'rgb(0, 198, 179)'
  ,'rgb(0, 202, 184)'
  ,'rgb(0, 205, 189)'
  ,'rgb(0, 209, 194)'
  ,'rgb(0, 213, 199)'
  ,'rgb(0, 217, 204)'
  ,'rgb(0, 221, 209)'
  ,'rgb(0, 224, 214)'
  ,'rgb(0, 228, 219)'
  ,'rgb(0, 232, 224)'
  ,'rgb(0, 236, 230)'
  ,'rgb(0, 240, 235)'
  ,'rgb(0, 244, 240)'
  ,'rgb(0, 247, 245)'
  ,'rgb(0, 251, 250)'
  ,'rgb(0, 255, 255)'
  ,'rgb(0, 250, 255)'
  ,'rgb(0, 245, 255)'
  ,'rgb(0, 240, 255)'
  ,'rgb(0, 235, 255)'
  ,'rgb(0, 230, 255)'
  ,'rgb(0, 224, 255)'
  ,'rgb(0, 219, 255)'
  ,'rgb(0, 214, 255)'
  ,'rgb(0, 209, 255)'
  ,'rgb(0, 204, 255)'
  ,'rgb(0, 199, 255)'
  ,'rgb(0, 194, 255)'
  ,'rgb(0, 189, 255)'
  ,'rgb(0, 184, 255)'
  ,'rgb(0, 179, 255)'
  ,'rgb(0, 173, 255)'
  ,'rgb(0, 168, 255)'
  ,'rgb(0, 163, 255)'
  ,'rgb(0, 158, 255)'
  ,'rgb(0, 153, 255)'
  ,'rgb(0, 148, 255)'
  ,'rgb(0, 143, 255)'
  ,'rgb(0, 138, 255)'
  ,'rgb(0, 133, 255)'
  ,'rgb(0, 128, 255)'
  ,'rgb(0, 122, 255)'
  ,'rgb(0, 117, 255)'
  ,'rgb(0, 112, 255)'
  ,'rgb(0, 107, 255)'
  ,'rgb(0, 102, 255)'
  ,'rgb(0, 97, 255)'
  ,'rgb(0, 92, 255)'
  ,'rgb(0, 87, 255)'
  ,'rgb(0, 82, 255)'
  ,'rgb(0, 77, 255)'
  ,'rgb(0, 71, 255)'
  ,'rgb(0, 66, 255)'
  ,'rgb(0, 61, 255)'
  ,'rgb(0, 56, 255)'
  ,'rgb(0, 51, 255)'
  ,'rgb(0, 46, 255)'
  ,'rgb(0, 41, 255)'
  ,'rgb(0, 36, 255)'
  ,'rgb(0, 31, 255)'
  ,'rgb(0, 26, 255)'
  ,'rgb(0, 20, 255)'
  ,'rgb(0, 15, 255)'
  ,'rgb(0, 10, 255)'
  ,'rgb(0, 5, 255)'
  ,'rgb(0, 0, 255)'
  ,'rgb(5, 0, 255)'
  ,'rgb(10, 0, 255)'
  ,'rgb(15, 0, 255)'
  ,'rgb(20, 0, 255)'
  ,'rgb(26, 0, 255)'
  ,'rgb(31, 0, 255)'
  ,'rgb(36, 0, 255)'
  ,'rgb(41, 0, 255)'
  ,'rgb(46, 0, 255)'
  ,'rgb(51, 0, 255)'
  ,'rgb(56, 0, 255)'
  ,'rgb(61, 0, 255)'
  ,'rgb(66, 0, 255)'
  ,'rgb(71, 0, 255)'
  ,'rgb(77, 0, 255)'
  ,'rgb(82, 0, 255)'
  ,'rgb(87, 0, 255)'
  ,'rgb(92, 0, 255)'
  ,'rgb(97, 0, 255)'
  ,'rgb(102, 0, 255)'
  ,'rgb(107, 0, 255)'
  ,'rgb(112, 0, 255)'
  ,'rgb(117, 0, 255)'
  ,'rgb(122, 0, 255)'
  ,'rgb(128, 0, 255)'
  ,'rgb(133, 0, 255)'
  ,'rgb(138, 0, 255)'
  ,'rgb(143, 0, 255)'
  ,'rgb(148, 0, 255)'
  ,'rgb(153, 0, 255)'
  ,'rgb(158, 0, 255)'
  ,'rgb(163, 0, 255)'
  ,'rgb(168, 0, 255)'
  ,'rgb(173, 0, 255)'
  ,'rgb(179, 0, 255)'
  ,'rgb(184, 0, 255)'
  ,'rgb(189, 0, 255)'
  ,'rgb(194, 0, 255)'
  ,'rgb(199, 0, 255)'
  ,'rgb(204, 0, 255)'
  ,'rgb(209, 0, 255)'
  ,'rgb(214, 0, 255)'
  ,'rgb(219, 0, 255)'
  ,'rgb(224, 0, 255)'
  ,'rgb(230, 0, 255)'
  ,'rgb(235, 0, 255)'
  ,'rgb(240, 0, 255)'
  ,'rgb(245, 0, 255)'
  ,'rgb(250, 0, 255)'
  ,'rgb(255, 0, 255)'
  ,'rgb(255, 0, 250)'
  ,'rgb(255, 0, 245)'
  ,'rgb(255, 0, 240)'
  ,'rgb(255, 0, 235)'
  ,'rgb(255, 0, 230)'
  ,'rgb(255, 0, 224)'
  ,'rgb(255, 0, 219)'
  ,'rgb(255, 0, 214)'
  ,'rgb(255, 0, 209)'
  ,'rgb(255, 0, 204)'
  ,'rgb(255, 0, 199)'
  ,'rgb(255, 0, 194)'
  ,'rgb(255, 0, 189)'
  ,'rgb(255, 0, 184)'
  ,'rgb(255, 0, 179)'
  ,'rgb(255, 0, 173)'
  ,'rgb(255, 0, 168)'
  ,'rgb(255, 0, 163)'
  ,'rgb(255, 0, 158)'
  ,'rgb(255, 0, 153)'
  ,'rgb(255, 0, 148)'
  ,'rgb(255, 0, 143)'
  ,'rgb(255, 0, 138)'
  ,'rgb(255, 0, 133)'
  ,'rgb(255, 0, 128)'
  ,'rgb(255, 0, 122)'
  ,'rgb(255, 0, 117)'
  ,'rgb(255, 0, 112)'
  ,'rgb(255, 0, 107)'
  ,'rgb(255, 0, 102)'
  ,'rgb(255, 0, 97)'
  ,'rgb(255, 0, 92)'
  ,'rgb(255, 0, 87)'
  ,'rgb(255, 0, 82)'
  ,'rgb(255, 0, 77)'
  ,'rgb(255, 0, 71)'
  ,'rgb(255, 0, 66)'
  ,'rgb(255, 0, 61)'
  ,'rgb(255, 0, 56)'
  ,'rgb(255, 0, 51)'
  ,'rgb(255, 0, 46)'
  ,'rgb(255, 0, 41)'
  ,'rgb(255, 0, 36)'
  ,'rgb(255, 0, 31)'
  ,'rgb(255, 0, 26)'
  ,'rgb(255, 0, 20)'
  ,'rgb(255, 0, 15)'
  ,'rgb(255, 0, 10)'
  ,'rgb(255, 0, 5)'
  ,'rgb(255, 0, 0)'
  ,'rgb(255, 5, 0)'
  ,'rgb(255, 10, 0)'
  ,'rgb(255, 15, 0)'
  ,'rgb(255, 20, 0)'
  ,'rgb(255, 26, 0)'
  ,'rgb(255, 31, 0)'
  ,'rgb(255, 36, 0)'
  ,'rgb(255, 41, 0)'
  ,'rgb(255, 46, 0)'
  ,'rgb(255, 51, 0)'
  ,'rgb(255, 56, 0)'
  ,'rgb(255, 61, 0)'
  ,'rgb(255, 66, 0)'
  ,'rgb(255, 71, 0)'
  ,'rgb(255, 77, 0)'
  ,'rgb(255, 82, 0)'
  ,'rgb(255, 87, 0)'
  ,'rgb(255, 92, 0)'
  ,'rgb(255, 97, 0)'
  ,'rgb(255, 102, 0)'
  ,'rgb(255, 107, 0)'
  ,'rgb(255, 112, 0)'
  ,'rgb(255, 117, 0)'
  ,'rgb(255, 122, 0)'
  ,'rgb(255, 128, 0)'
  ,'rgb(255, 133, 0)'
  ,'rgb(255, 138, 0)'
  ,'rgb(255, 143, 0)'
  ,'rgb(255, 148, 0)'
  ,'rgb(255, 153, 0)'
  ,'rgb(255, 158, 0)'
  ,'rgb(255, 163, 0)'
  ,'rgb(255, 168, 0)'
  ,'rgb(255, 173, 0)'
  ,'rgb(255, 179, 0)'
  ,'rgb(255, 184, 0)'
  ,'rgb(255, 189, 0)'
  ,'rgb(255, 194, 0)'
  ,'rgb(255, 199, 0)'
  ,'rgb(255, 204, 0)'
  ,'rgb(255, 209, 0)'
  ,'rgb(255, 214, 0)'
  ,'rgb(255, 219, 0)'
  ,'rgb(255, 224, 0)'
  ,'rgb(255, 230, 0)'
  ,'rgb(255, 235, 0)'
  ,'rgb(255, 240, 0)'
  ,'rgb(255, 245, 0)'
  ,'rgb(255, 250, 0)'
  ,'rgb(255, 255, 0)'
];

    var dictColor = {};
    dictColor["Red"] = "#FF0000";
    //dictColor["Red"] = "rgb(255, 0, 0);";  //only some browsers support rgb http://www.w3schools.com/cssref/css_colors_legal.asp
    dictColor["Green"] = "#00FF00";
    dictColor["Blue"] = "#0000FF";
    dictColor["Magenta"] = "#FF00FF";
    dictColor["Cyan"] = "#00FFFF";
    dictColor["Yellow"] = "#FFFF00";
    dictColor["Purple"] = "#8800FF";
    dictColor["Orange"] = "#FFAA00";
    dictColor["Black"] = "#000000";
    dictColor["ltGrey"] = "#CCCCCC";

    //Dictionarys
    var letterColor = {};
    letterColor["a"] = "#F9CC65"; //color Meter
    letterColor["b"] = "#EFC461"; //color Meter
    letterColor["c"] = "#E5BC5D"; //color Meter 
    letterColor["d"] = "#59FF71"; //color Meter
    letterColor["e"] = "#55FF6D"; //color Meter
    letterColor["f"] = "#52F768"; //color Meter
    letterColor["g"] = "#BBFF5C"; //color Meter
    letterColor["h"] = "#B4FF59"; //color Meter
    letterColor["i"] = "#ACF655"; //color Meter
    letterColor["j"] = "#A5EC51"; //color Meter 
    letterColor["k"] = "#6EFFEB"; //color Meter
    letterColor["l"] = "#69FAE2"; //color Meter
    letterColor["m"] = "#65F0D8"; //color Meter
    letterColor["n"] = "#61E5CF"; //color Meter
    letterColor["o"] = "#7B8FFF"; //color Meter
    letterColor["p"] = "#7B8FFF"; //color Meter
    letterColor["q"] = "#7084EA"; //color Meter
    letterColor["r"] = "#6C7EE1"; //color Meter
    letterColor["s"] = "#5CDBC5"; //color Meter
    letterColor["t"] = "#58D1BC"; //color Meter
    letterColor["u"] = "#53C6B3"; //color Meter
    letterColor["v"] = "#FF26EE"; //color Meter
    letterColor["x"] = "#ED24DB"; //color Meter
    letterColor["w"] = "#F725E5"; //color Meter
    letterColor["y"] = "#AE2CFF"; //color Meter
    letterColor["z"] = "#9DE14E"; //color Meter
    var orgColorCodes = {};
    orgColorCodes["mutate_old"] = "#00FF00"; //color Meter green
    orgColorCodes["mutate"] = "#000000"; //color black
    orgColorCodes["start"] = "#5300FF"; //color Meter blue - I don't think this is used.
    orgColorCodes["headFill_old"] = "#777777"; //color Meter grey
    orgColorCodes["headFill"] = "#AAAAAA"; //lighter grey
    orgColorCodes["WRITE"] = "#FA0022"; //color Meter  red
    orgColorCodes["READ"] = "#5300FF"; //color Meter  blue
    orgColorCodes["FLOW"] = "#00FF00"; //color Meter  green
    orgColorCodes["IP"] = "#000000"; //color Meter  black
    orgColorCodes["outline"] = "#666666"; //grey
    orgColorCodes["0"] = "#BBBBFF"; //lt blue
    orgColorCodes["1"] = "#F5FF00"; //color Meter yellow
    var headCodes = {};
    headCodes["READ"] = "R";
    headCodes["WRITE"] = "W";
    headCodes["FLOW"] = "F";
    headCodes["IP"] = "I";
    var InstDescribe = {};
    InstDescribe["a"]="nop-A is a no-operation instruction, and will not do anything when executed. It can, however, modify the behavior of the instruction preceding it (by changing the CPU component that it affects; see also nop-register notation and nop-head notation) or act as part of a template to denote positions in the genome.";
    InstDescribe["b"]="nop-B is a no-operation instruction, and will not do anything when executed. It can, however, modify the behavior of the instruction preceding it (by changing the CPU component that it affects; see also nop-register notation and nop-head notation) or act as part of a template to denote positions in the genome.";
    InstDescribe["c"]="nop-C is a no-operation instruction, and will not do anything when executed. It can, however, modify the behavior of the instruction preceding it (by changing the CPU component that it affects; see also nop-register notation and nop-head notation) or act as part of a template to denote positions in the genome.";
    InstDescribe["d"]="if-n-equ: This instruction compares the BX register to its complement. If they are not equal, the next instruction (after a modifying no-operation instruction, if one is present) is executed. If they are equal, that next instruction is skipped.";
    InstDescribe["e"]="if-less: This instruction compares the BX register to its complement. If BX is the lesser of the pair, the next instruction (after a modifying no-operation instruction, if one is present) is executed. If it is greater or equal, then that next instruction is skipped.";
    InstDescribe["f"]="if-label: This instruction reads in the template that follows it, and tests if its complement template was the most recent series of instructions copied. If so, it executed the next instruction, otherwise it skips it. This instruction is commonly used for an organism to determine when it has finished producing its offspring.";
    InstDescribe["g"]="mov-head: This instruction will cause the IP to jump to the position in memory of the flow-head.";
    InstDescribe["h"]="jmp-head: This instruction will read in the value of the CX register, and the move the IP by that fixed amount through the organism's memory.";
    InstDescribe["i"]="get-head: This instruction will copy the position of the IP into the CX register.";
    InstDescribe["j"]="set-flow: This instruction moves the flow-head to the memory position denoted in the CX register.";
    InstDescribe["k"]="shift-r: This instruction reads in the contents of the BX register, and shifts all of the bits in that register to the right by one. In effect, it divides the value stored in the register by two, rounding down.";
    InstDescribe["l"]="shift-l: This instruction reads in the contents of the BX register, and shifts all of the bits in that register to the left by one, placing a zero as the new rightmost bit, and truncating any bits beyond the 32 maximum. For values that require fewer than 32 bits, it effectively multiplies that value by two.";
    InstDescribe["m"]="inc: This instruction reads in the content of the BX register and increments it by one.";
    InstDescribe["n"]="dec: This instruction reads in the content of the BX register and decrements it by one.";
    InstDescribe["o"]="pop: This instruction removes the top element from the active stack, and places it into the BX register.";
    InstDescribe["p"]="push: This instruction reads in the contents of the BX register, and places it as a new entry at the top of the active stack. The BX register itself remains unchanged.";
    InstDescribe["q"]="swap-stk: This instruction toggles the active stack in the CPU. All other instructions that use a stack will always use the active one.";
    InstDescribe["r"]="swap: This instruction swaps the contents of the BX register with its complement.";
    InstDescribe["s"]="add: This instruction reads in the contents of the BX and CX registers and sums them together. The result of this operation is then placed in the BX register.";
    InstDescribe["t"]="sub: This instruction reads in the contents of the BX and CX registers and subtracts CX from BX (respectively). The result of this operation is then placed in the BX register.";
    InstDescribe["u"]="nand: This instruction reads in the contents of the BX and CX registers (each of which are 32-bit numbers) and performs a bitwise nand operation on them. The result of this operation is placed in the BX register. Note that this is the only logic operation provided in the basic avida instruction set.";
    InstDescribe["v"]="h-copy: This instruction reads the contents of the organism's memory at the position of the read-head, and copy that to the position of the write-head. If a non-zero copy mutation rate is set, a test will be made based on this probability to determine if a mutation occurs. If so, a random instruction (chosen from the full set with equal probability) will be placed at the write-head instead.";
    InstDescribe["w"]="h-alloc: This instruction allocates additional memory for the organism up to the maximum it is allowed to use for its offspring.";
    InstDescribe["x"]="h-divide: This instruction is used for an organism to divide off a finished offspring. The original organism keeps the state of its memory up until the read-head. The offspring's memory is initialized to everything between the read-head and the write-head. All memory past the write-head is removed entirely.";
    InstDescribe["y"]="IO: This is the input/output instruction. It takes the contents of the BX register and outputs it, checking it for any tasks that may have been performed. It will then place a new input into BX.";
    InstDescribe["z"]="h-search: This instruction will read in the template the follows it, and find the location of a complement template in the code. The BX register will be set to the distance to the complement from the current position of the instruction-pointer, and the CX register will be set to the size of the template. The flow-head will also be placed at the beginning of the complement template. If no template follows, both BX and CX will be set to zero, and the flow-head will be placed on the instruction immediately following the h-search.";
