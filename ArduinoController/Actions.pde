static abstract class Action {
	private int id;
	private static int idCounter=0;

	abstract void execute();
	abstract String toString();
  abstract String toCode();

	Action()
	{
		id= idCounter++;
	}

	int getId(){ return id; }

	protected void delayms (float ms) {
		try {
			Thread.sleep((long)ms);
		} catch (Exception e) {}
	}
}

class SimpleInput extends Action {
  Pin pin;
  int inValue;

  SimpleInput (Pin pin) {
    super();
    this.pin= pin;
    pin.setInput();//.setAnalog();
    pin.setActive();
  }
  
  @Override
  void execute() {
    inValue = pin.read();
  }
    
  @Override
  String toString() {
    return "[" + getId() + "] Read "+pin.getName();
  }
  
  @Override
  String toCode() {
    String code = "//" + toString() + "\n";
    code += "pinMode(" + pin.getName().substring(1, pin.getName().length()) + ", INPUT);\n";
    if(pin.getName().substring(0,1).equals("D"))
      code += "digitalRead(" + pin.getName().substring(1, pin.getName().length()) + ");\n";
    else
      code += "analogRead(A" + pin.getName().substring(1, pin.getName().length()) + ");\n";
    return code;
  }
  
  int readValue() {
    return this.inValue;
  }
}

class SimpleOutput extends Action {
	Pin pin;
	int value;
  String strValue;

	SimpleOutput (Pin pin, int value) {
		super();
		pin.setOutput().setAnalog();
		init (pin, value);
	}

	SimpleOutput (Pin pin, String strValue) {
		super();
		pin.setOutput().setDigital();
    this.strValue = strValue;

		if (strValue.equals("high")) value= Arduino.HIGH;
		else if (strValue.equals("low")) value= Arduino.LOW;
		else 
		{
      if(pin.pinNumber == 2 || pin.pinNumber == 4 || pin.pinNumber == 7 || pin.pinNumber == 8 || pin.pinNumber == 12 || pin.pinNumber == 13) {
        pin.setOutput().setDigital();
      } else {
			  pin.setOutput().setAnalog();
      }
			value= parseInt(strValue);
		}
		init(pin, value);
	}

	void init(Pin pin, int value)
	{
		this.pin = pin;
		this.value = value;
	}

	@Override
	void execute() {
		pin.write (value);
	}

	@Override
	String toString()
	{
    if( (pin.pinNumber == 2 || pin.pinNumber == 4 || pin.pinNumber == 7 || pin.pinNumber == 8 || pin.pinNumber == 12 || pin.pinNumber == 13) && !this.strValue.equals("high") && !this.strValue.equals("low"))
      return "[" + getId() + "] Write " + pin.getName() + " " + this.strValue + " : Recommend to change with an analog pin or digital value";
    if(pin.getName().substring(0,1).equals("D")) return "[" + getId() + "] Write " + pin.getName() + " " + this.strValue;
    else return "[" + getId() + "] Write " + pin.getName() + " " + value;
	}

  @Override
  String toCode() {
    String code = "//" + toString() + "\n"; 
    code += "pinMode(" + pin.getName().substring(1, pin.getName().length()) + ", OUTPUT);\n";
    if(pin.getName().substring(0,1).equals("D"))
      code += "digitalWrite(" + pin.getName().substring(1, pin.getName().length()) + ", " + this.strValue.toUpperCase() + ");\n";
    else
      code += "analogWrite(" + pin.getName().substring(1, pin.getName().length()) + ", " + this.value + ");\n";
    return code;
  }
}

class SetModeAction extends Action {
	Pin pin;
	String value;

	SetModeAction (Pin pin, String inputOutput) {
		super();
		this.pin= pin;
		value= inputOutput;
	}

	@Override
	void execute() {
		if (value.equals("input")) pin.setInput();
		else if (value.equals("output")) pin.setOutput();
	}

	@Override
	String toString()
	{
		return "[" + getId() + "] Set " + pin.getName() + " " + value;
	}

  @Override
  String toCode() {
    String code = "//" + toString() + "\n"; 
    code += "pinMode(" + pin.getName().substring(1, pin.getName().length()) + ", " + value.toUpperCase() + ");\n";
    return code;
  }
}

class ResetAction extends Action {
	Board board;
	Pin pin;

	ResetAction (Board board, Pin pin) {
		super();
		this.board= board;
		this.pin= pin;
	}

	@Override
	void execute() {
		Thread t = new Thread() {
			public void run() {
				board.resetPin(pin.getName());
				pin.reset();
			}
		};
		t.start();
	}

  @Override
	String toString()
	{
		return "[" + getId() + "] Reset " + pin.getName();
	}

  @Override
  String toCode() {
    String code = "//" + toString() + "\n";
    code += "pinMode(" + pin.getName().substring(1, pin.getName().length()) + ", OUTPUT);\n";
    if(pin.getName().substring(0,1).equals("D"))
      code += "digitalWrite(" + pin.getName().substring(1, pin.getName().length()) + ", LOW);\n";
    else
      code += "analogWrite(" + pin.getName().substring(1, pin.getName().length()) + ", 0);\n";
    return code;
  }
}

class ResetAllAction extends Action {
	Board board;

	ResetAllAction (Board board) {
		super();
		this.board= board;
	}	

	@Override
	void execute() {
		board.reset();
	}

	@Override
	String toString()
	{
		return "[" + getId() + "] Reset all";
	}

  @Override
  String toCode() {
    String code = "//" + toString() + "\n";
    /*
    for(int i=0; i<6; i++) {
      code += "pinMode(" + i + ", OUTPUT);\n";
      code += "analogWrite(" + i + ", 0);\n";
    }
    for(int i=0; i<14; i++) {
      code += "pinMode(" + i + ", OUTPUT);\n";
      code += "digitalWrite(" + i + ", LOW);\n";
    }*/
    return code;
  }
}

class DoAfterAction extends Action {
	private int time;
	private Action action;	

	DoAfterAction (Action a, int timeMs) {
		super();
		action= a;
		time= timeMs;
	}	

	@Override
	void execute() {
		Thread t = new Thread() {
			public void run() {
				delayms(time);
				if (action!=null) action.execute();
			}
		};
		t.start();
	}

	@Override
	String toString()
	{
		return "[" + getId() + "] Do action { "+ action +" } after "+time/1000+" seconds";
	}

  @Override
  String toCode() {
    String code = "//" + toString() + "\n";
    code += "delay(" + time + ");\n";
    code += action.toCode();
    code += "\n// end-of DoAfter \n";
    return code;
  }
}



abstract class RepeatedAction extends Action
{
	int refreshRateMs;
	boolean active;
	public final int INFINITE= -1;

	RepeatedAction()
	{
		refreshRateMs= 100;
		active= true;
	}

	void setRefreshRate (int ms) {
		refreshRateMs = ms;
	}

	int getRefreshRate()
	{
		return refreshRateMs;
	}

	void stop() {
		active = false;
	}

	boolean isActive()
	{
		return active;
	}

	abstract String getSourcePin();
}

enum Comparison {EQ, NE, GT, LT, GET, LET, BT};

class ConditionalAction extends RepeatedAction {
	Comparison comp;
	Pin pin;
	int inValue_1;
  int inValue_2;
	Action output;

	ConditionalAction (Comparison comp, Pin pin, int inValue_1, int inValue_2, Action output) {
		super();
		this.comp = comp;
		this.pin= pin;
		this.inValue_1 = inValue_1;
    this.inValue_2 = inValue_2;
		this.output= output;
		pin.setActive();
	}

	@Override
	void execute() {
		Thread t = new Thread() {
			public void run() {
				while (isActive()) {
					switch (comp) {
					case EQ: if (pin.read() == inValue_1) output.execute(); break;
					case NE: if (pin.read() != inValue_1) output.execute(); break;
					case GT: if (pin.read() > inValue_1) output.execute(); break;
					case LT: if (pin.read() < inValue_1) output.execute(); break;
					case GET: if (pin.read() >= inValue_1) output.execute(); break;
					case LET: if (pin.read() <= inValue_1) output.execute(); break;
          case BT: if(inValue_1 > inValue_2) { 
                      if ((pin.read() >= inValue_2) && (pin.read() <= inValue_1))
                        output.execute();
                    } else if(inValue_1 < inValue_2) { 
                      if ((pin.read() >= inValue_1) && (pin.read() <= inValue_2))
                        output.execute();
                    }
                    break;
					}

					try {
						Thread.sleep(getRefreshRate());
					} catch (Exception e) {
					}

				}
			}
		};
		t.start();

	}

	@Override
	String toString() {
    String comparison = "";
    switch (comp) {
          case EQ: if (pin.read() == inValue_1) output.execute(); comparison = " == "; break;
          case NE: if (pin.read() != inValue_1) output.execute(); comparison = " != "; break;
          case GT: if (pin.read() > inValue_1) output.execute(); comparison = " > "; break;
          case LT: if (pin.read() < inValue_1) output.execute(); comparison = " < "; break;
          case GET: if (pin.read() >= inValue_1) output.execute(); comparison = " >= "; break;
          case LET: if (pin.read() <= inValue_1) output.execute(); comparison = " <= "; break;
          case BT: if ((pin.read() >= inValue_1) && (pin.read() <= inValue_2)) output.execute(); comparison = " between ";
                   return "[" + getId() + "] if "+ "( " +pin.getName() + comparison + inValue_1 + " and " + inValue_2 + ") then { " + output + " }";
    }
		return "[" + getId() + "] if "+ "( " +pin.getName() + comparison + inValue_1 + " ) then { " + output + " }";
	}

  @Override
  String toCode() {
    String comparison = "";
    String code = "//" + toString() + "\n";
    switch (comp) {
          case EQ: if (pin.read() == inValue_1) output.execute(); comparison = " == "; break;
          case NE: if (pin.read() != inValue_1) output.execute(); comparison = " != "; break;
          case GT: if (pin.read() > inValue_1) output.execute(); comparison = " > "; break;
          case LT: if (pin.read() < inValue_1) output.execute(); comparison = " < "; break;
          case GET: if (pin.read() >= inValue_1) output.execute(); comparison = " >= "; break;
          case LET: if (pin.read() <= inValue_1) output.execute(); comparison = " <= "; break;
          case BT: if ((pin.read() >= inValue_1) && (pin.read() <= inValue_2)) output.execute(); comparison = " between "; break;
    }
    if(pin.getName().substring(0, 1).equals("D")){
      code += "if(" + "digitalRead(" + pin.getName().substring(1, pin.getName().length()) +")" + comparison + inValue_1 + ")\n";
    } else {
      if(comparison == " between ") {
        code += "int inputValue = analogRead(" + pin.getName().substring(1, pin.getName().length()) +");\n";
        code += "if(" + "inputValue  >= " + inValue_1 + " && " + "inputValue <= " + inValue_2 + ")\n";
      } else {
        code += "if(" + "analogRead(" + pin.getName().substring(1, pin.getName().length()) +")" + comparison + inValue_1 + ")\n";
      }
    }
    code += "{\n" + output.toCode() + "}\n";
    return code;
  }
  
	@Override
	String getSourcePin() {
		return pin.getName();
	}
}


class Pipe extends RepeatedAction {
	Pin fromPin, toPin;

	Pipe (Pin from, Pin to) {
		super();
		fromPin = from;
		toPin= to;

		//fromPin.setInput();
		toPin.setOutput().setAnalog();
	}

	@Override
	void execute() {
		Thread t = new Thread() {
			public void run() {
				fromPin.addConnection(toPin);
				while (isActive()) {
					toPin.write(fromPin.read());
					delayms (getRefreshRate());
				}
			}
		};
		t.start();
	}	

	@Override
	String toString() {
		return "[" + getId() + "] Pass data from "+fromPin.getName()+" to "+toPin.getName();
	}

  @Override
  String toCode() {
    String code = "//" + toString() + "\n";
    code += "int inputValue = 0;\n";
    code += "pinMode(" + toPin.getName().substring(1, toPin.getName().length()) + ", OUTPUT);\n";
    code += "inputValue = analogRead(" + fromPin.getName().substring(1, fromPin.getName().length()) + ");\n";
    code += "analogWrite(" + toPin.getName().substring(1, toPin.getName().length()) + ", inputValue" + ");\n";
    return code;
  }

	@Override
	String getSourcePin()
	{
		return fromPin.getName();
	}
}


class Pulse extends RepeatedAction {
	Pin pin;
	int times;
	float period;

	Pulse (Pin pin, int periodMs) {
		super();
		this.pin = pin;
		this.times = INFINITE;
		period = periodMs;
	}


	Pulse (Pin pin, int periodMs, int times) {
		super();
		this.pin = pin;
		if (times <=0) throw new RuntimeException("Only positive times are allowed");
		this.times = times;
		period = periodMs;
	}

	@Override
	void execute() {
		Thread t = new Thread() {
			public void run() {
				while (isActive()) {

					pin.write (Arduino.HIGH);
					delayms (period);
					if (!isActive()) return;
					pin.write (Arduino.LOW);
					delayms (period);
					if (!isActive()) return;

					if (times !=INFINITE)
					{
						if (times<=0) return;
						times--;
					}
				}
			}
		};
		t.start();
	}

	@Override
	String toString()
	{
		if (times==INFINITE) return "[" + getId() + "] Pulse from "+pin.getName()+" every "+period+"ms";
		return "[" + getId() + "] Pulse "+pin.getName()+" every "+period/1000+" seconds "+times+" times";
	}

  @Override
  String toCode() {
    String code = "//" + toString() + "\n";
    code += "pinMode(" + pin.getName().substring(1, pin.getName().length()) + ", OUTPUT);\n";
    code += "int period = " + period + "; \n";
    code += "int times = " + times + "; \n";
    code += "for(int i=0; i<" + times + "; i++) { \n";
    code += "  delay(period); \n";
    code += "  digitalWrite(" + pin.getName().substring(1, pin.getName().length()) + ", HIGH);\n";
    code += "  delay(period); \n";
    code += "  digitalWrite(" + pin.getName().substring(1, pin.getName().length()) + ", LOW);\n";
    code += "}\n";
    code += "// end-of Pulse \n";
    return code;
  }

	@Override
	String getSourcePin()
	{
		return pin.getName();
	}
}



/*
class RepeatAction extends RepeatedAction {
	int times;
	Action action;

	RepeatAction (Action a, int periodMs) {
		super();
		this.times = INFINITE;
		action= a;
	}


	RepeatAction (Action a, int periodMs, int times) {
		super();
		if (times <=0) throw new RuntimeException("Only positive times are allowed");
		this.times = times;
		action= a;
	}

	@Override
	void execute() {
		Thread t = new Thread() {
			public void run() {
				while (isActive()) {

					if (action!=null) action.execute();

					if (times !=INFINITE)
					{
						if (times<=0) return;
						times--;
					}
				}
			}
		};
		t.start();
	}

	@Override
	String toString()
	{
		if (times==INFINITE) return getId()+") Repeat action ["+action+"]";
		return getId()+") Repeat action ["+action+"] "+times+" times";
	}
}
*/