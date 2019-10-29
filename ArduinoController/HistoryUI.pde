import controlP5.*;
import java.time.LocalDateTime;


class Console implements Observer
{
	ControlP5 cp5;
	Textarea consoleText;
  //Textarea codeText;
	String lines;
  String codes;
	boolean instructionOn;
  boolean commandsOn;
  int state = 0;
	PImage instructionImg;
	int x,y,w,h;

	Console(PApplet app, int x, int y, int w, int h) {
		cp5 = new ControlP5(app);
		lines="";
    codes="";
		this.x=x; this.y=y; this.w=w; this.h=h;
		instructionImg= loadImage("commands.jpg");

		consoleText = cp5.addTextarea("console")
		              .setPosition(x, y)
		              .setSize(w, h)
		              .setFont(createFont("arial", 14))
		              .setLineHeight(18)
		              .setColor(color(120, 250, 70))
		              .setColorBackground(color(100, 230))
		              .setColorForeground(color(100, 230));
/*
    codeText = cp5.addTextarea("code")
                  .setPosition(0, y)
                  .setSize(x, h)
                  .setFont(createFont("arial", 14))
                  .setLineHeight(18)
                  .setColor(color(0,0,0))
                  .setColorBackground(color(255, 255))
                  .setColorForeground(color(255, 255));*/
		reset();
	}

	public void update (Observable o, Object param) {
		if (param instanceof Action) {
			Action a = (Action)param;
			lines = a + "\n" + lines;
      codes += a.toCode() + "\n";
			consoleText.setText(lines);
      //codeText.setText(codes);
		}
	}

  String getCode() {
    return codes;
  }
  
  void saveArduinoCode(String filename, String setup, String loop) {
    String arduinoCode = "/*\n\tAuto-Generated Code by HeyTeddy\n\t";
    arduinoCode += LocalDateTime.now();
    arduinoCode += "\n*/\n\n";
    arduinoCode += "void setup() {\n";
    arduinoCode += setup;
    arduinoCode += "\n}\n";
    arduinoCode += "\nvoid loop() {\n";
    arduinoCode += loop;
    arduinoCode += "}";
    saveStrings(filename, split(arduinoCode, '\n'));
  }
  
  /*
  void confirmToSaveFile() {
  }*/

	void draw()
	{
		if (instructionOn)
			image(instructionImg, x,y,515,600);
    //if (commandsOn)
      
	}

	void reset()
	{
		consoleText.setText("Commands");
		instructionOn=false;
    commandsOn=true;
    state = 0;
	}

	void toggleInstructions()
	{
		instructionOn= !instructionOn;
    //consoleText.setVisible(instructionOn);
	}
/*
  void toggleCommands() {
    commandsOn= !commandsOn;
    consoleText.setVisible(commandsOn);
  }
*/
	void mousePressed()
	{
		if (mouseX<x || mouseX>x+w) return;
		if (mouseY<y || mouseY>y+h) return;
    //if(mouseX > 0 && mouseX <x) toggleCode();
    //else
    //toggleInstructions();
    if(state == 3) state = 0;
    state++;
    switch (state) {
      case 1:
        consoleText.setVisible(true);
        break;
      case 2:
        consoleText.setVisible(false);
        toggleInstructions();
        break;
      case 3:
        consoleText.setVisible(false);
        toggleInstructions();
        break;
    
    }
  }
}