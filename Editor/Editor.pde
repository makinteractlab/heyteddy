import java.awt.Font;
import controlP5.*;
ControlP5 cp5;

import g4p_controls.*;
GTextArea txa_speechoutput;
GTextArea txa_speechoutput_test;
GLabel label_speechoutput;
GLabel label_speechoutput_test;

Table csvTable;
Table csvTableBackup;
String[] jsCodes;
String[] jsCodesBackup;
String[] pdeCodes;
String[] pdeCodesBackup;
Textarea componentList;
boolean init = true;
String csvFile = "Load the csv file";
String jsFile = "Load the js file";
String imgFile = "You can add image file for how to use the new component";
String componentName = "test";
String speechOutput = "";
String action = "none";
String pinType = "none";
String componentListStr = "Open the csv file to load the existing components list.";
String componentDuplicateCheck = "";
String saveResult = "";
String imgFormat = "";
PImage howto;
boolean csvFileLoaded = false;
boolean jsFileLoaded = false;
boolean imgFileLoaded = false;
boolean duplicated = false;
boolean addComponent = false;
boolean pinTypeSelected = false;
boolean actionSelected = false;

RadioButton r1, r2;

PFont myFont;

void setupForG4p() {
  G4P.setGlobalColorScheme(GCScheme.CYAN_SCHEME);
  txa_speechoutput = new GTextArea(this, 280, 348, 480, 80);
  txa_speechoutput.tag = "txa_speechoutput";
  txa_speechoutput.setPromptText("Enter the speech output of the usage for your component.");
  txa_speechoutput.setFont(new Font("Helvetica", Font.PLAIN, 20));
  
  txa_speechoutput_test = new GTextArea(this, 280, 450, 480, 80);
  txa_speechoutput_test.tag = "txa_speechoutput_test";
  txa_speechoutput_test.setPromptText("Enter the speech output for guide to test your component.");
  txa_speechoutput_test.setFont(new Font("Helvetica", Font.PLAIN, 20));
  
  label_speechoutput = new GLabel(this, 280, txa_speechoutput.getY()-18, 480, 18);
  label_speechoutput.setAlpha(190);
  label_speechoutput.setTextAlign(GAlign.LEFT, null);
  label_speechoutput.setOpaque(true);
  label_speechoutput.setFont(new Font("Helvetica", Font.PLAIN, 20));
  
  label_speechoutput_test = new GLabel(this, 280, txa_speechoutput_test.getY()-18, 480, 18);
  label_speechoutput_test.setAlpha(190);
  label_speechoutput_test.setTextAlign(GAlign.LEFT, null);
  label_speechoutput_test.setOpaque(true);
  label_speechoutput_test.setFont(new Font("Helvetica", Font.PLAIN, 20));
  
  G4P.setCursor(ARROW);
}

void setup() {
  size(800,650);
  cp5 = new ControlP5(this);
  myFont = createFont("Helvetica",20, true);
  setupForG4p();
  
  cp5.addButton("OpenJSfile")
     .setValue(1)
     .setPosition(50,50)
     .setSize(200,30)
     .setCaptionLabel("Open js file")
     .setFont(myFont)
     ;
     
  cp5.addButton("OpenCSVfile")
     .setValue(1)
     .setPosition(50,100)
     .setSize(200,30)
     .setCaptionLabel("Open csv file")
     .setFont(myFont)
     ;
     
  cp5.addButton("OpenIMGfile")
     .setValue(1)
     .setPosition(50,150)
     .setSize(200,30)
     .setCaptionLabel("Add jpg/png file")
     .setFont(myFont)
     ;
     
  componentList = cp5.addTextarea("txt")
                     .setPosition(50,330)
                     .setSize(200,200)
                     .setFont(myFont)
                     .setLineHeight(20)
                     .setColor(color(0))
                     .setColorBackground(color(255,100))
                     .setColorForeground(color(255,100))
                     ;
     
  cp5.addTextfield("InputForComponentName")
     .setCaptionLabel("")
     .setPosition(50,200)
     .setSize(200,30)
     .setFont(myFont)
     .setAutoClear(false)
     .setColorCursor(color(0))
     .setColorBackground(color(255,255,255,29))
     .setColor(color(0,0,0))
     .setFocus(true)
     ;
  
  //cp5.addTextfield("SpeechOutput")
  //   .setCaptionLabel("")
  //   .setPosition(280,330)
  //   .setSize(480,200)
  //   .setFont(myFont)
  //   .setAutoClear(false)
  //   .setColor(color(255,255,255))
  //   .setColorCursor(color(255))
  //   .setColorBackground(color(255,255,255,29))
  //   .setFocus(true)
  //   ;
       
  cp5.addButton("Add")
     .setPosition(50,550)
     .setFont(myFont)
     .setSize(90,30)
     .getCaptionLabel().align(ControlP5.CENTER, ControlP5.CENTER)
     ;
     
  cp5.addButton("Save")
     .setPosition(560,550)
     .setFont(myFont)
     .setSize(90,30)
     .getCaptionLabel().align(ControlP5.CENTER, ControlP5.CENTER)
     ;
     
  cp5.addButton("Cancel")
     .setPosition(670,550)
     .setFont(myFont)
     .setSize(90,30)
     .getCaptionLabel().align(ControlP5.CENTER, ControlP5.CENTER)
     ;
     
  r1 = cp5.addRadioButton("radioAction")
          .setPosition(50,250)
          .setSize(50,20)
          .setColorForeground(color(120))
          .setColorActive(color(232, 190, 205))
          .setColorLabel(color(0))
          .setItemsPerRow(2)
          .setSpacingColumn(50)
          .addItem("Input",1)
          .addItem("Output",2)
          .setFont(myFont)
          ;
     
  for(Toggle t:r1.getItems()) {
    t.getCaptionLabel().setColorBackground(color(255,80));
    t.getCaptionLabel().getStyle().moveMargin(-7,0,0,-3);
    t.getCaptionLabel().getStyle().movePadding(7,0,0,3);
    t.getCaptionLabel().getStyle().backgroundWidth = 45;
    t.getCaptionLabel().getStyle().backgroundHeight = 13;
  }
     
  r2 = cp5.addRadioButton("radioPinType")
          .setPosition(50,290)
          .setSize(50,20)
          .setColorForeground(color(120))
          .setColorActive(color(232, 190, 205))
          .setColorLabel(color(0))
          .setItemsPerRow(2)
          .setSpacingColumn(50)
          .addItem("Analog",1)
          .addItem("Digital",2)
          .setFont(myFont)
          ;
         
  for(Toggle t:r2.getItems()) {
    t.getCaptionLabel().setColorBackground(color(255,80));
    t.getCaptionLabel().getStyle().moveMargin(-7,0,0,-3);
    t.getCaptionLabel().getStyle().movePadding(7,0,0,3);
    t.getCaptionLabel().getStyle().backgroundWidth = 45;
    t.getCaptionLabel().getStyle().backgroundHeight = 13;
  }
  
  textFont(myFont);
  loadAllDefualFiles();
  init = false;
}

void loadAllDefualFiles() {
    csvTable = loadTable("../AlexaSkill/COMPONENT.csv");
    csvTableBackup = loadTable("../AlexaSkill/COMPONENT.csv");
    csvFile = "../AlexaSkill/COMPONENT.csv";
    componentListStr = "";
    for(int i=0; i<csvTable.getRowCount(); i++)
      componentListStr += csvTable.getString(i, 0)+"\n";
    componentList.setText(componentListStr);
    csvFileLoaded = true;
    
    jsCodes = loadStrings("../AlexaSkill/index.js");
    jsCodesBackup = loadStrings("../AlexaSkill/index.js");
    jsFile = "../AlexaSkill/index.js";
    jsFileLoaded = true;
    
    howto = loadImage("./arduino_uno_board.png");
    imgFile = "./arduino_uno_board.png \n You can add the usage image of your new component.";
    imgFormat = ".png";
    imgFileLoaded = true;
}

void draw() {
  //background(138, 173, 186);
  background(202, 224, 230);
  textFont(myFont);       
  fill(0);
  //textAlign(LEFT);
  //text("This text is left aligned.",width/2,100); 
  text(jsFile, 280, 70);
  text(csvFile, 280, 120);
  text(imgFile, 280, 170);
  text(componentDuplicateCheck, 65, 610);
  text(saveResult, 575, 610);
  fill(255);
  //text(cp5.get(Textfield.class,"Component").getText(), 20, 130);
  componentName = cp5.get(Textfield.class,"InputForComponentName").getText().toLowerCase();
  //speechOutput = cp5.get(Textfield.class,"SpeechOutput").getText();
  componentList.setText(componentListStr);
  //text(Component, 360,180);
  
  label_speechoutput.setText("Speech output for \"How to use\" component");
  label_speechoutput_test.setText("Speech output for \"Test\" component");
}

public void displayEvent(String name, GEvent event) {
  String extra = " event fired at " + millis() / 1000.0 + "s";
  print(name + "   ");
  switch(event) {
  case CHANGED:
    println("CHANGED " + extra);
    break;
  case SELECTION_CHANGED:
    println("SELECTION_CHANGED " + extra);
    break;
  case LOST_FOCUS:
    println("LOST_FOCUS " + extra);
    break;
  case GETS_FOCUS:
    println("GETS_FOCUS " + extra);
    break;
  case ENTERED:
    println("ENTERED " + extra);  
    break;
  default:
    println("UNKNOWN " + extra);
  }
}

public void handleTextEvents(GEditableTextControl textControl, GEvent event) { 
  displayEvent(textControl.tag, event);
}


void radioAction(int selected) {
  if(selected == 1) {
    println("read");
    action = "read";
    actionSelected = true;
  } else if(selected == 2) {
    println("write");
    action = "write";
    actionSelected = true;
  }
}

void radioPinType(int selected) {
  if(selected == 1) {
    println("analog");
    pinType = "analog";
    pinTypeSelected = true;
  } else if(selected == 2) {
    println("digital");
    pinType = "digital";
    pinTypeSelected = true;
  }
}

//public void Add() {
//  cp5.get(Textfield.class,"Component").clear();
//}

//public void Save() {
//  cp5.get(Textfield.class,"Component").clear();
//}

void controlEvent(ControlEvent theEvent) {
  if(theEvent.isAssignableFrom(Textfield.class)) {
    println("controlEvent: accessing a string from controller '"
            +theEvent.getName()+"': "
            +theEvent.getStringValue()
            );
  }
}

public void InputForComponentName(String theText) {
  // automatically receives results from controller input
  println("a textfield event for controller 'input' : "+theText);
}

public void modifyPdeForHowTo() {
    pdeCodes = loadStrings("../HeyTeddy/Parser.pde");
    pdeCodesBackup = loadStrings("../HeyTeddy/Parser.pde");
    
    for(int i=0; i<pdeCodes.length; i++) {
      if(pdeCodes[i].contains("DO NOT REMOVE THIS COMMENT: function setBoardImg")) {
        String code = "\t\telse if(component.equals(\"" + componentName + "\")) {\n";
        code += "\t\t\tui.setBoardImg(\"" + componentName + imgFormat + "\");\n\t\t}";
        pdeCodes = splice(pdeCodes, code, i+1);
      }
    }
}

public void Add() {
  if(!init) {
    if(!csvFileLoaded || !jsFileLoaded) {
      componentDuplicateCheck = "Load csv and js file.";
      addComponent = false;
      return;
    }
    
    if(pinType == "none" || action == "none") {
      componentDuplicateCheck = "Please select the properties of your component to add.";
      addComponent = false;
      return;
    }
      
    for(int i=0; i<csvTable.getRowCount(); i++) {
      if(duplicated) break;
      for(int j=0; j<csvTable.getColumnCount(); j++) {
        String tableData = csvTable.getString(i,j);
        if(tableData != null) {
          String temp[] = split(tableData, ' ');
          String tableDataNoSpace = "";
          for(int k=0; k<temp.length; k++)
            tableDataNoSpace += temp[k].trim();
          if(componentName.toLowerCase().equals(tableData.toLowerCase()) || componentName.toLowerCase().equals(tableDataNoSpace.toLowerCase())) {
            duplicated = true;
            break;
          } else {
            duplicated = false;
          }
        }
      }
    }

    if(duplicated) {
      componentDuplicateCheck = "The "+ componentName + " already exists.";
      addComponent = false;
    } else {
      // modify pde for how to img
      modifyPdeForHowTo();
      
      // modify csv file
      componentDuplicateCheck = "Added";
      csvTable.setString(csvTable.lastRowIndex()+1,0,componentName);
      componentListStr += componentName + "\n";
      
      // modify index.js
      for(int i=0; i<jsCodes.length; i++) {
        if(jsCodes[i].contains("DO NOT REMOVE THIS COMMENT: function handleHWTest")) {
          String code = "\t\tcase \""+componentName+"\":\n\t\t\tcomponent = "
          + "\"" + componentName + "\""
          +";\n\t\t\tintentObj.attributes.action = "
          + "\"" + action + "\""
          +";\n\t\t\tintentObj.attributes.pinType = "
          + "\"" + pinType + "\""
          +";\n\t\t\tspeechOutput = \"Let's check the \"" + " + component + "
          +"\" is working. Tell me the pin number of Arduino you used.\""
          +";\n\t\t\tintentObj.emit(\':ask\', speechOutput)"
          +";\n\t\t\tbreak"+";";
          jsCodes = splice(jsCodes, code, i+1);
        }
        
        if(jsCodes[i].contains("DO NOT REMOVE THIS COMMENT: function handleHowtoIntent")) {
          String howToTextArea = txa_speechoutput.getText();
          String[] howToSpeech = howToTextArea.split("\\n");
          String code = "\t\tcase \""+componentName+"\":\n";
          
          code += "\t\t\tcomponent = " + "\"" + componentName + "\";\n";
          code += "\t\t\tspeechOutput += \"Here is an example of using a \" + component + \".";
          code += " <break time=\\\"10s\\\" />\";\n";
          
          //Add Speech output text from the text Area for How To Use command
          if(howToTextArea != "" || howToTextArea != " ") { //<>//
            for(int j=0; j<howToSpeech.length; j++) {
              code += "\t\t\tspeechOutput += \"" + howToSpeech[j];
              code += " <break time=\\\"10s\\\" />\";\n";
            }
          }
          
          code += "\t\t\tspeechOutput += \"Just say, \\\" Check \" + component + \" \\\" or \\\"Test \" + component + \" \\\" if you want to test your component. ";
          code += " <break time=\\\"10s\\\" />\";\n";
          code += "\t\t\tbreak"+";";
          jsCodes = splice(jsCodes, code, i+1);
        }
        
        if(jsCodes[i].contains("DO NOT REMOVE THIS COMMENT: function helpHardwareDebug")) {
          String testTextArea = txa_speechoutput_test.getText();
          String[] testDebugSpeech = testTextArea.split("\\n");
          String code = "\t\tcase \""+componentName+"\":\n";
                   
          //Add Speech output text from the text Area for How To Use command
          if(testTextArea != "" || testTextArea != " ") {
            for(int j=0; j<testDebugSpeech.length; j++) {
              code += "\t\t\tspeechOutput += \"" + testDebugSpeech[j];
              code += " <break time=\\\"10s\\\" />\";\n";
            }
          }
          
          code += "\t\t\tbreak"+";";
          jsCodes = splice(jsCodes, code, i+1);
        }
        
        if(jsCodes[i].contains("DO NOT REMOVE THIS COMMENT: function handleHardwareDebug")) {
          String code = "\t\t\tcase \""+componentName+"\":\n";
          
          if(action == "write") {
            if(pinType == "analog") {
              code +=  "\t\t\t\twriteMotorJson(intentObj);\n";
            } else if(pinType == "digital") {
              code +=  "\t\t\t\twriteLedJson(intentObj);\n";
            }
          } else if(action == "read") {
            code += "\t\t\t\treadPinJson(intentObj);\n";
          }

          code += "\t\t\t\tintentObj.attributes.pinType = \"" + pinType + "\";\n";
          
          if(action == "write")
            code += "\t\t\t\tspeechOutput = \"Now, I'm writing + the output pin. \";\n";
          else if(action == "read")
            code += "\t\t\t\tspeechOutput = \"Now, I'm reading the input pin. Does the "+ componentName +" work?\";\n";
          
          code += "\t\t\t\trepromptSpeech = \"Does the "+ componentName +" work?\";\n";
          code += "\t\t\t\tbreak"+";";

          jsCodes = splice(jsCodes, code, i+1);
        }
      }
    }
    addComponent = true;

    //} else {
    //  componentDuplicateCheck = "Load csv and js file.";
    //  addComponent = false;
    //}
  }
}

public void Save() {
  if(!init) {
    if(addComponent) {
      saveTable(csvTable, "componentList.csv");
      saveTable(csvTableBackup, "componentList_bak.csv");  
      saveStrings("index.js", jsCodes);
      saveStrings("index.js.bak", jsCodesBackup);
      
      howto.save("../HeyTeddy/data/"+componentName+imgFormat);
      saveStrings("../HeyTeddy/Parser.pde", pdeCodes);
      saveStrings("../HeyTeddy/Parser.pde.bak", pdeCodesBackup);
      
      saveResult = "Saved";
    } else {
      saveResult = "There is no change.";
    }
  }
}

public void Cancel() {
  if(!init) {
    exit();
  }
}

public void OpenIMGfile(int theValue) {
  if(!init)
    selectInput("Select a csv file to process:", "imgFileSelected");
}

public void OpenCSVfile(int theValue) {
  if(!init)
    selectInput("Select a csv file to process:", "csvFileSelected");
}

public void OpenJSfile(int theValue) {
  if(!init)
    selectInput("Select a js file to process:", "jsFileSelected");
}

void csvFileSelected(File selection) {
  if (selection == null) {
    println("Window was closed or the user hit cancel.");
    //csvFileLoaded = false;
  } else {
    println("User selected " + selection.getAbsolutePath());
    if(selection.getPath().contains("csv")) {
      csvTable = loadTable(selection.getAbsolutePath());
      csvTableBackup = loadTable(selection.getAbsolutePath());
      csvFile = selection.getPath();
      componentListStr = "";
      for(int i=0; i<csvTable.getRowCount(); i++)
        componentListStr += csvTable.getString(i, 0)+"\n";
      componentList.setText(componentListStr);
      
      csvFileLoaded = true;
    } else {
      csvFile = "Please, select the csv File";
      //csvFileLoaded = false;
    }
  }
}

void jsFileSelected(File selection) {
  if (selection == null) {
    println("Window was closed or the user hit cancel.");
    //jsFileLoaded = false;
  } else {
    println("User selected " + selection.getAbsolutePath());
    if(selection.getPath().contains("js")) {
      jsCodes = loadStrings(selection.getAbsolutePath());
      jsCodesBackup = loadStrings(selection.getAbsolutePath());
      jsFile = selection.getPath();
      jsFileLoaded = true;
    } else {
      jsFile = "Please, select the js File.";
      //jsFileLoaded = false;
    }
  }
}

void imgFileSelected(File selection) {
  if (selection == null) {
    println("Window was closed or the user hit cancel.");
    //imgFileLoaded = false;
  } else {
    imgFormat = "";
    println("User selected " + selection.getAbsolutePath());
    if(selection.getPath().contains("jpg")) {
      imgFormat = ".jpg";
      imgFile = selection.getPath();
      imgFileLoaded = true;
      howto = loadImage(imgFile);
    } else if(selection.getPath().contains("png")) {
      imgFormat = ".png";
      imgFile = selection.getPath();
      imgFileLoaded = true;
      howto = loadImage(imgFile);
    } else {
      imgFile = "Please, select the jpg or png File";
      //imgFileLoaded = false;
    }
  }
}

//void changeWidth(int theValue) {
//  componentList.setWidth(theValue);
//}

//void changeHeight(int theValue) {
//  componentList.setHeight(theValue);
//}