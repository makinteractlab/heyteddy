import cc.arduino.*;
import processing.net.*;
import processing.serial.*;
import java.util.*;


class ProtalkParser extends Observable implements Runnable {
	Board board;
  BoardUI ui;
	Client connection;
	PApplet hnd;
	int instructionCounter;

	String dbgJSON;
	boolean dbgMode;
	public final int UPDATE_MS = 1000;

  JSONArray localHistoryJson = new JSONArray();

	ProtalkParser (PApplet app, Board board) {
		super();
		init(app, board);
		dbgMode = false;
	}

  ProtalkParser (PApplet app, Board board, BoardUI ui) {
    super();
    init(app, board);
    this.ui = ui;
    dbgMode = false;
  }

	ProtalkParser (PApplet app, Board board, String dbgFileName) {
		super();
		init(app, board);
		dbgMode = true;

		// load DBG file in a string
		dbgJSON = "";
		for (String s : loadStrings(dbgFileName)) dbgJSON += s;

	}

	void init(PApplet app, Board board) {
		this.board = board;
		hnd = app;
		instructionCounter = 0;
	}


	void start() {
		(new Thread(this)).start();
	}

	public void run() {
		while (true) {

			if (dbgMode) {
				parseJsonData (dbgJSON);
			} else {
				connectToHost();
				parseJsonData (fetchJSON());
				closeConnection();
			}

			delayms (UPDATE_MS);
		}
	}

	private void connectToHost() {
		connection = new Client(hnd, "www.artecasa.co.kr", 80);
		connection.write("GET /white/yj/backup/src/voiceControl.json HTTP/1.0\n");
		connection.write("Host: artecasa.co.kr\n\n");
		delayms (1000);
	}

	private String fetchJSON() {
		String result = "";
		if (connection.available() > 0) {
			String data = connection.readString();
			if (data.isEmpty() || data.equals("")) return null;

			int start = data.indexOf("{");
			int end = data.length();
			if (start==-1 || end==-1) return null;

			result = data.substring(start, end);
			result += "\n";
		}
		return result;
	}

	private void closeConnection() {
		if (connection != null) connection.stop();
	}

	private void parseJsonData(String str) {
		if (str==null) return;

		JSONObject json;
		try {
			json = parseJSONObject(str);
		} catch (Exception e) {
			println("JSON parsing failed");
      println(str);
			return;
		}

		JSONArray cmds = json.getJSONArray("commands");

		for (int i = 0; i < cmds.size(); i++) {
			try {
				JSONObject cmd = cmds.getJSONObject(i);
        
				int id = cmd.getInt("id");
				String action = cmd.getString("action");
				println("action: " + action);
        if (action.equals("restart")) instructionCounter = 1;
        
				JSONObject params = cmd.getJSONObject("params");
				if (id <= instructionCounter) continue;
				instructionCounter = id;
        localHistoryJson.append(cmd);

				Action a = getAction(action, params);
				if (a == null) continue;
				board.addAndExecuteAction(a);
				
				// update listeners
				setChanged();
				notifyObservers(a);
			} catch (Exception e) {
				println("JSON parsing failed");
				continue;
			}

		}
    JSONObject localJson = new JSONObject();
    localJson.setJSONArray("commands", localHistoryJson);
    saveJSONObject(localJson, "data/localHistory.json");
	}

	private Action getAction (String action, JSONObject obj) {
		Action a = null;
		if (action.equals("write")) a = getWriteAction(obj);
    else if(action.equals("read")) a = getReadAction(obj);
		else if (action.equals("set")) a = getSetAction(obj);
		else if (action.equals("reset")) a = getResetAction(obj);
		else if (action.equals("resetall")) a = getResetAllAction (obj);
		else if (action.equals("condition")) a = getConditionAction (obj);
		else if (action.equals("pipe")) a = getPipeAction (obj);
		else if (action.equals("pulse")) a = getPulseAction (obj);
		else if (action.equals("doafter")) a = getDoAfterAction (obj);
    else if (action.equals("show")) setBoardImg(obj);
		//else if (action.equals("repeat")) a = getRepeatAction (obj);
		else if (action.equals("delay")) println ("delay");
		return a;
	}
/* DO NOT REMOVE THIS COMMENT: SET_BOARD_IMG */
  private void setBoardImg(JSONObject params) {
    String component =params.getString("component");
    
    if(component.equals("motor")) {
      ui.setBoardImg("motor.png");
    } else if(component.equals("button")) {
      ui.setBoardImg("button.png");
    } else if(component.equals("switch")) {
      ui.setBoardImg("switch.png");
    } else if(component.equals("potentiometer") || component.equals("rotaryencoder")) {
      ui.setBoardImg("potentiometer.png");
    } else if(component.equals("photoresistor")) {
      ui.setBoardImg("photoresistor.png");
    } else if(component.equals("l.e.d.")) {
      ui.setBoardImg("led.png");
    } else if(component.equals("board")) {
      ui.setBoardImg("arduino_uno_board.png");
    } else if(component.equals("task")) {
      ui.setBoardImg("task.png");
    } else if(component.equals("temperature")) {
      ui.setBoardImg("temperature.png");
    //} else if(component.equals("step 1")) {
    //  ui.setAnimation(2, 3);
    //} else if(component.equals("step 2")) {
    //  ui.setAnimation(4, 5);
    //} else if(component.equals("step 3")) {
    //  ui.setAnimation(8, 4);
    //} else if(component.equals("step 4")) {
    //  ui.setAnimation(12, 4);
    //} else if(component.equals("step 5")) {
    //  ui.setAnimation(15, 4);
    } else if(component.equals("anemometer") || component.equals("wind sensor")) {
      ui.setBoardImg("anemometer.png");
    } else if(component.equals("flex sensor")) {
      ui.setBoardImg("flexsensor.png");
    } else if(component.equals("hall effect sensor") || component.equals("hall sensor")) {
      ui.setBoardImg("halleffectsensor.png");
    } else if(component.equals("piezo")) {
      ui.setBoardImg("piezo.png");
    } else if(component.equals("tilt sensor")) {
      ui.setBoardImg("tiltsensor.png");
    } else if(component.equals("cathod l.e.d") || component.equals("color light") || component.equals("r.g.b. l.e.d.")) {
      ui.setBoardImg("rgbled.png");
    } /* DO NOT REMOVE THIS COMMENT: function setBoardImg */
  }

	private Action getWriteAction (JSONObject json) {
		String pinName = json.getString("pin");
		String value = json.getString("value");

		return new SimpleOutput (board.getPin(pinName), value);
	}

  private Action getReadAction (JSONObject json) {
    String pinName = json.getString("pin");

    return new SimpleInput (board.getPin(pinName));
  }

	private Action getSetAction (JSONObject json) {
		String pinName = json.getString("pin");
		String value = json.getString("value");

		return new SetModeAction(board.getPin(pinName), value);
	}

	private Action getResetAction (JSONObject json) {
		String pinName = json.getString("pin");
		return new ResetAction(board, board.getPin(pinName));
	}

	private Action getResetAllAction (JSONObject json) {
		String pinName = json.getString("pin");
		return new ResetAllAction(board);
	}

	private Action getConditionAction (JSONObject json) {
		String pinName = json.getString("pin");
    String value = "";
    String value_1 = "";
    String value_2 = "";
    int v1 = 0;
    int v2 = 0;

		Comparison cmp = null;
		String comp = json.getString("comparison");
		if (comp.equals("is")) cmp = Comparison.EQ;
		else if (comp.equals("is not")) cmp = Comparison.NE;
		else if (comp.equals("is greater than")) cmp = Comparison.GT;
		else if (comp.equals("is less than")) cmp = Comparison.LT;
		else if (comp.equals("is greater than or equal to")) cmp = Comparison.GET;
		else if (comp.equals("is less than or equal to")) cmp = Comparison.LET;
    else if (comp.equals("is between")) cmp = Comparison.BT;
    
    if(cmp == Comparison.BT) {
      value_1 = json.getString("startValue");
      v1 = parseInt (value_1);
      value_2 = json.getString("endValue");
      v2 = parseInt (value_2);
    } else {
  		value = json.getString("value");
  		v1 = 0;
  		if (value.equals("high")) v1 = Arduino.HIGH;
  		else if (value.equals("low")) v1 = Arduino.LOW;
  		else v1 = parseInt (value);
    }

		JSONObject obj = json.getJSONObject("command");
		String action = obj.getString("action");

		Action a = getAction (action, obj.getJSONObject("params"));
		return new ConditionalAction (cmp, board.getPin(pinName), v1, v2, a);
	}

	private Action getPipeAction (JSONObject json) {
		String fromPinName = json.getString("fromPin");
		String toPinName = json.getString("toPin");
		return new Pipe (board.getPin(fromPinName), board.getPin(toPinName));
	}

	private Action getPulseAction (JSONObject json) {
		String pin = json.getString("pin");
		int period = parseInt (json.getString("period"));
		int repetitions = parseInt (json.getString("repetitions"));
		if (repetitions>0) return new Pulse (board.getPin(pin), period, repetitions);
		return new Pulse (board.getPin(pin), period);
	}

	private Action getDoAfterAction (JSONObject json)
	{
		int time = parseInt (json.getString("time"));
		JSONObject obj = json.getJSONObject("command");
		String action = obj.getString("action");
		Action a = getAction (action, obj.getJSONObject("params"));
		return new DoAfterAction (a,time);
	}


	// private Action getRepeatAction (JSONObject json)
	// {
	// 	int repetitions = parseInt (json.getString("repetitions"));
	// 	JSONObject obj = json.getJSONObject("command");
	// 	String action = obj.getString("action");
	// 	Action a = getAction (action, obj.getJSONObject("params"));
	// 	return new RepeatAction (a,repetitions);
	// }



	private void delayms (float ms) {
		try {
			Thread.sleep((long)ms);
		} catch (Exception e) {}
	}
}
