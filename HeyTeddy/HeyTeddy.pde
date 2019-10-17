import java.util.ArrayList; 

// Action action, action1, action2;

Board uno;
BoardUI ui;
Console console;
ProtalkParser pt;




void setup() {
	uno = new Board(this, 1);
	
	//ui = new BoardUI(55, 0, height);
  ui = new BoardUI(0, 0, height);
	uno.addObserver(ui);

	console= new Console(this, 510, 0, 504, height);

	pt = new ProtalkParser (this, uno, ui);
	//pt = new ProtalkParser (this, uno, "testDBG.json");
	pt.addObserver (console);

	pt.start();
}

String[] getCode(String code)
{
  String compNext = "";
  String compCurr = "";
  String result[] = {"", ""};
  
  int start;
  int end;
  
  if(code.indexOf("Reset all")>0) {
    start = code.indexOf("Reset all")+9;
    end = code.length();
    code = code.substring(start, end);
  }

  String codeArray[] = code.split("\n");
  
  List<String> codeAll = new ArrayList<String>();
  List<String> setup = new ArrayList<String>();
  
  Collections.addAll(codeAll, codeArray);
  
  for(int i=0; i< codeAll.size(); i++) {
    String codeStr = (String) codeAll.get(i);
    if(codeStr.indexOf("pinMode") != -1) {
      setup.add("\t" + codeStr + "\n");
      codeAll.remove(i); 
    }
  }

  for(int i=0; i<setup.size() ; i++) {
    compCurr = (String) setup.get(i);
    for(int j=1; j<setup.size()-1; j++) {
      String curr = compCurr;
      compNext = (String) setup.get(j);
      
      start = curr.indexOf("pinMode(")+8;
      end = start + 2;
      curr = curr.substring(start, end);
      
      start = compNext.indexOf("pinMode(")+8;
      end = start + 2;
      compNext = compNext.substring(start, end);
      
      if(curr.equals(compNext)) {
        setup.remove(i);
        break;
      }
    }
  }
  
  Iterator<String> iterator = setup.iterator();
  while (iterator.hasNext()) {
    String string = (String) iterator.next();
    result[0] += string;
  }
  
  result[1] = getLoopCode(codeAll);
  
  return result;
}

String getLoopCode(List<String> loop)
{
  String result = "";
  Iterator<String> iterator = loop.iterator();
  while (iterator.hasNext()) {
    String string = (String) iterator.next();
    result += "\t" + string + "\n";
  }
  
  return result;
}

void mousePressed()
{
  if(mouseX < 590) {
    //println(console.getCode());
    String code[] = getCode(console.getCode());

    console.saveArduinoCode("./arduinoCode/arduinoCode.ino", code[0], code[1]);
    String path = "/home/pi/Works/protalk/version03/Processing/Protalk/arduinoCode/arduinoCode.ino";
    launch(path);
    println("launch");
  } else {
    console.mousePressed();
  }  
}

/*
void launchApp(String path) {
  try {
    Process p = Runtime.getRuntime().exec(path);
  } catch (Exception e){
    println("Error running command!");  
    println(e);
  }
}*/

public void settings() {
	size(1024, 600);
}


void draw() {
	background(80);
	ui.draw();
	console.draw();
//println(mouseX +"," + mouseY);
}