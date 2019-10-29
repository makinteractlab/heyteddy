class PinException extends RuntimeException {
	PinException() {
		super ("Invalid operation with this type of Pin");
	}
}


abstract class Pin extends Observable implements Runnable {
	Arduino arduino;

	String pinName;
	int pinNumber;
	boolean output;
	int value;
	int previusValue;
	boolean active;
	ArrayList<Pin> connections;	


	public final int UPDATE_MS = 100;

	Pin (Arduino arduino, String pinName, int pinNumber) {
		super();
		this.arduino = arduino;
		this.pinName = pinName;
		this.pinNumber = pinNumber;
		output = true;
		active = false;

		connections= new ArrayList<Pin>();

		(new Thread(this)).start();
	}

	void addConnection (Pin pin)
	{
		connections.add (pin);
		setChanged();
		notifyObservers(this);
	}

	boolean  hasConnection()
	{
		return !connections.isEmpty();
	}

	ArrayList<String> getConnections()
	{
		ArrayList<String> result= new ArrayList<String>();
		for (Pin p:connections)
		{
			result.add(p.getName());
		}
		return result;
	}

	private void removeConnection (Pin pin)
	{
		String key= pin.getName();
		removeConnection(key);
	}

	private void removeConnection (String pinName)
	{
		for (Iterator<Pin> iterator = connections.iterator(); iterator.hasNext();) {
		    String name = iterator.next().getName();
		    if (name.equals(pinName)) {
		        iterator.remove();
		    }
		}
	}

	private void removeAllConnections()
	{
		connections.clear();
	}



	String getName() {
		return pinName;
	}

	abstract boolean isDigital();
	abstract void write (int value);
	abstract int read();
	abstract Pin setDigital();
	abstract Pin setAnalog();

	boolean isActive() {
		return active;
	}

	boolean isAnalog() {
		return !isDigital();
	}

	boolean isOutput() {
		return output;
	}

	boolean isInput() {
		return !output;
	}

	boolean isHigh() {
		return value == Arduino.HIGH;
	}

	boolean isLow() {
		return !isHigh();
	}

	Pin setInput() {
		setActive();
		output = false;
		return this;
	}

	Pin setOutput() {
		setActive();
		output = true;
		return this;
	}

	void reset() {
		active = false;
		removeAllConnections();
		setChanged();
		notifyObservers(this);
	}

	void setActive() {
		active = true;
		setChanged();
		notifyObservers(this);
	}

	public void run() {
		while (true) {
			// check for changes

			if (active)
			{
				int v = read();
				if (v != previusValue) {
					previusValue = v;
					setChanged();
					notifyObservers(this);
				}
			}

			try {
				Thread.sleep(UPDATE_MS);
			} catch (Exception e) {}
		}

	}


}



class AnalogPin extends Pin {
	AnalogPin (Arduino arduino, int pinNumber) throws PinException {
		super(arduino, "A" + pinNumber, pinNumber);
		if (pinNumber < 0 || pinNumber > 5) throw new PinException();
		setInput();
	}

	@Override
	boolean isDigital() {
		return false;
	}

	@Override
	Pin setDigital() throws PinException {
		if (this instanceof AnalogPin) throw new PinException();
		return this;
	}

	@Override
	Pin setAnalog() {
		return this;
	}

	@Override
	Pin setOutput() throws PinException {
		if (this instanceof AnalogPin) throw new PinException();
		return this;
	}

	@Override
	void write (int value) { /*NOTHING TO DO*/ }

	@Override
	int read() {
		return arduino.analogRead (pinNumber);
	}
}


class DigitalPin extends Pin {
	boolean digital;

	DigitalPin (Arduino arduino, int pinNumber) throws PinException {
		super(arduino, "D" + pinNumber, pinNumber);
		if (pinNumber < 0 || pinNumber > 13) throw new PinException();
		digital = true;
		setOutput();
	}

	@Override
	boolean isDigital() {
		return digital;
	}

	@Override
	Pin setInput() {
		super.setInput();
		arduino.pinMode(pinNumber, Arduino.INPUT);
		setChanged();
		notifyObservers(this);
		return this;
	}

	@Override
	Pin setOutput() {
		super.setOutput();
		arduino.pinMode(pinNumber, Arduino.OUTPUT);
		setChanged();
		notifyObservers(this);
		return this;
	}

	@Override
	Pin setDigital() {
		digital = true;
		setChanged();
		notifyObservers(this);
		return this;
	}

	@Override
	Pin setAnalog() throws PinException {
		if (pinNumber != 3 &&
		        pinNumber != 5 &&
		        pinNumber != 6 &&
		        pinNumber != 9 &&
		        pinNumber != 10 &&
		        pinNumber != 11) throw new PinException();

		digital = false;
		setChanged();
		notifyObservers(this);
		return this;
	}

	@Override
	void write (int value) {
		if (!output) return;

		this.value = value;
		if (digital) {
			int digiValue = (value == 0) ? Arduino.LOW : Arduino.HIGH;
			arduino.digitalWrite (pinNumber, digiValue);
		} else {
			//int mappedVal = (int) map(value, 0, 1023, 0, 255);
			//arduino.analogWrite (pinNumber, mappedVal);
      arduino.analogWrite (pinNumber, value);
		}

		setActive();
		setChanged();
		notifyObservers(this);
	}

	@Override
	int read() {
		if (output) return value;
		return arduino.digitalRead(pinNumber);
	}

	@Override
	void reset() {
		write(Arduino.LOW);
		super.reset();
	}

}







class Board {
	Arduino arduino;
	HashMap<String, Pin> pins;
	ArrayList<Action> commandsSet;


	Board(PApplet app, int portNumber) {
		println (Arduino.list());
		arduino = new Arduino(app, Arduino.list()[portNumber], 57600);
		init();
		commandsSet = new ArrayList<Action>();
	}

	void init() {
		pins = new HashMap<String, Pin>();
		pins.put ("D0", new DigitalPin(arduino, 0));
		pins.put ("D1", new DigitalPin(arduino, 1));
		pins.put ("D2", new DigitalPin(arduino, 2));
		pins.put ("D3", new DigitalPin(arduino, 3));
		pins.put ("D4", new DigitalPin(arduino, 4));
		pins.put ("D5", new DigitalPin(arduino, 5));
		pins.put ("D6", new DigitalPin(arduino, 6));
		pins.put ("D7", new DigitalPin(arduino, 7));
		pins.put ("D8", new DigitalPin(arduino, 8));
		pins.put ("D9", new DigitalPin(arduino, 9));
		pins.put ("D10", new DigitalPin(arduino, 10));
		pins.put ("D11", new DigitalPin(arduino, 11));
		pins.put ("D12", new DigitalPin(arduino, 12));
		pins.put ("D13", new DigitalPin(arduino, 13));

		pins.put ("A0", new AnalogPin(arduino, 0));
		pins.put ("A1", new AnalogPin(arduino, 1));
		pins.put ("A2", new AnalogPin(arduino, 2));
		pins.put ("A3", new AnalogPin(arduino, 3));
		pins.put ("A4", new AnalogPin(arduino, 4));
		pins.put ("A5", new AnalogPin(arduino, 5));
	}

	void addObserver(Observer o) {
		for (Pin p : pins.values())
			p.addObserver(o);

		reset();
	}

	void addAndExecuteAction (Action a)
	{
		commandsSet.add (a);
		a.execute();
	}


	Pin getPin (String name) {
		if (pins.containsKey(name)) return pins.get(name);
		return null;
	}

	void setPinDigitalWrite (String name) {
		getPin(name).setDigital().setOutput();
	}

	void setPinDigitalRead (String name) {
		getPin(name).setDigital().setInput();
	}

	void setPinAnalogWrite (String name) {
		getPin(name).setAnalog().setOutput();
	}

	void setPinAnalogRead (String name) {
		getPin(name).setAnalog().setInput();
	}

	void reset () {
		resetPin("D0");
		resetPin("D1");
		resetPin("D2");
		resetPin("D3");
		resetPin("D4");
		resetPin("D5");
		resetPin("D6");
		resetPin("D7");
		resetPin("D8");
		resetPin("D9");
		resetPin("D10");
		resetPin("D11");
		resetPin("D12");
		resetPin("D13");

		resetPin("A0");
		resetPin("A1");
		resetPin("A2");
		resetPin("A3");
		resetPin("A4");
		resetPin("A5");
	}

	private void resetPin (String name) {

		for (Action a : commandsSet)
		{
			if (a instanceof RepeatedAction)
			{
				RepeatedAction ra= ((RepeatedAction)a);
				if (ra.getSourcePin().equals(name)) ra.stop();
			}
		}
		getPin(name).reset();
	}
}



class BoardUI implements Observer {

	class PinUI {
		color output, input, current;
		boolean visible;
		float valueTransparency;
    int valueOriginal;
		int x, y, w, h;

    PFont f;
    
		PinUI (int x, int y, int w, int h) {
			this.x = x; this.y = y;
			this.w = w; this.h = h;
			current = color(0, 0, 0, 0);
			output = color(255, 0, 0);
			input = color(51, 204, 51);
      //input = color(0, 255, 0);
			visible = false;

      f = createFont("consola.ttf", 18);
      textFont(f);
		}
    
    void drawText(int x, int y, float value, int align) {
      fill(current);
      textAlign(align);
      text((int)value, x, y, align);
    }
    
		void setAsInput() {
			visible = true;
			current = input;
		}

		void setAsOutput() {
			visible = true;
			current = output;
		}

		void setInactive() {
			visible = false;
		}

		void setValue(int value, int orig) {
			valueTransparency = value;
      valueOriginal = orig;
		}

		void draw() {
			if (!visible) return;
			fill(current, valueTransparency);
			stroke(current);
			strokeWeight(2);
			rectMode(CENTER);
			rect(x, y, w, h);

      if(x > 100 ) drawText(x+35, y+7, valueOriginal, LEFT);
      else drawText(x-35, y+7, valueOriginal, RIGHT);
		}

		PVector getLocation()
		{
			return new PVector(x,y);
		}
	}

	class Connection
	{
		String connectionStart;
		PinUI start, end;

		Connection(String s, String e)
		{
			connectionStart= s;
			start= getPinUI(s); 
			end=getPinUI(e);
		}

		String getConnectionName()
		{
			return connectionStart;
		}
	}


	PImage bg;
	int x, y, w, h;
	ArrayList<PinUI> analogPins, digitalPins;
	//ArrayList<Connection> connections;

	BoardUI (int x, int y, int height) {
		super();

		bg = loadImage("arduino_uno_board.png");
		this.x = x;
		this.y = y;
		h = height;
		w = (int)(bg.width * bg.height / height);

		
		//connections= new ArrayList<Connection>();

		createAnalogPinShapes();
		createDigitalPins();
	}

  void setBoardImg(String img) {
    bg = loadImage(img);
  }
  
  void setAnimation(int start, int numberOfImages) {
    PImage[] animation = new PImage[numberOfImages];
    for(int i = 0; i < animation.length; i ++)
    {
      bg = loadImage( "./Task/" + start +".png");
      delay(1000);
    }
  }

	// private void addConnection (String start, String end)
	// {
	// 	connections.add (new Connection (start, end));
	// }

	// private void removeConnection(String start)
	// {
	// 	for (Iterator<Connection> iterator = connections.iterator(); iterator.hasNext();) {
	// 	    String name = iterator.next().getConnectionName();
	// 	    if (name.equals(start)) {
	// 	        iterator.remove();
	// 	    }
	// 	}
	// }


	void draw() {
		image(bg, x, y, w, h);
		for (PinUI p : analogPins) p.draw();
		for (PinUI p : digitalPins) p.draw();

		
		// for (Iterator<Connection> iterator = connections.iterator(); iterator.hasNext();) 
		// {
		// 	Connection c= iterator.next();
		// 	if (c==null) return;
		//     PinUI from= c.start;
		//     PinUI to=  c.end;
		//     drawConnection (from, to);
		// }
	}

	// void drawConnection (PinUI from, PinUI to)
	// {
	// 	stroke (255,0,0);
	// 	noFill();
	// 	PVector s= from.getLocation();
	// 	PVector e= to.getLocation();
	// 	float dis= sqrt ((s.x-e.x)*(s.x-e.x) + (s.y-e.y)*(s.y-e.y))/3;

	// 	if (s.x == e.x)
	// 	{
	// 		if (s.x < x+w/2) bezier(s.x, s.y, s.x+dis, s.y, s.x+dis, e.y, e.x, e.y); // on the left
	// 		else bezier(s.x, s.y, s.x-dis, s.y, s.x-dis, e.y, e.x, e.y); // on the right
	// 	}
	// 	else
	// 		line (s.x, s.y, e.x, e.y);
	// }

	public void update (Observable o, Object param) {
		if (param instanceof Pin) {
		
			Pin p = (Pin)param;
			String src= p.getName();

			if (!p.isActive())
			{
				inactiveVisual(src);
				//removeConnection(src);
				return;
			}

			if (p.isInput()) inputVisual(src);
			else if (p.isOutput()) outputVisual(src);

      int val = p.read();
			// fill the squares
			if (p.isDigital()) {
				if (val == Arduino.LOW) valueVisual(src, 0, val);
				else if(val >= Arduino.HIGH) valueVisual(src, 255, val);
			} else {
				int mappedVal = (int) map(val, 0, 1023, 0, 255);
        if ( (p.pinNumber == 3 || p.pinNumber == 5 || p.pinNumber == 6 || p.pinNumber == 9 || p.pinNumber == 10 | p.pinNumber == 11) && (p.getName().substring(0,1).equals("D")) )
          valueVisual(src, val, val);
        else
				  valueVisual(src, mappedVal, val);
			}

			// // connections
			// if (!p.hasConnection()) return;
			// ArrayList<String> pins= p.getConnections();
			// for (String target: pins) connections.add (new Connection (src, target));
		}
	}



	private void outputVisual (String name) {
		try {
			getPinUI(name).setAsOutput();
		} catch (Exception e) {println ("Such pin does not exist");}
	}

	private void inputVisual (String name) {
		try {
			getPinUI(name).setAsInput();
		} catch (Exception e) {println ("Such pin does not exist");}
	}

	private void inactiveVisual (String name) {
		try {
			getPinUI(name).setInactive();
		} catch (Exception e) {println ("Such pin does not exist");}
	}

	private void valueVisual (String name, int visualValue, int origValue) {
		try {
			PinUI p = getPinUI(name);
			if (p != null) p.setValue(visualValue, origValue);
		} catch (Exception e) {println ("Such pin does not exist");}
	}

	private void createAnalogPinShapes() {
		analogPins = new ArrayList<PinUI>();

		int startx = x + 97;
		int starty = y + 431;
		int gap = 18;
		int sizePin = 10;

		for (int i = 0; i < 6; i++) {
			analogPins.add (new PinUI(startx, starty + gap * i, sizePin, sizePin));
		}
	}

	private void createDigitalPins() {
		digitalPins = new ArrayList<PinUI>();

		// TOP
		int startx = x + 435;
		int starty = y + 280;
		int gap = 18;
		int sizePin = 10;

		for (int i = 0; i < 6; i++) {
			digitalPins.add (0, new PinUI(startx, starty + gap * i, sizePin, sizePin));
		}

		// TOP
		starty = y + 396;

		for (int i = 0; i < 8; i++) {
			digitalPins.add (0, new PinUI(startx, starty + gap * i, sizePin, sizePin));
		}
	}

	private PinUI getPinUI(String name) {
		ArrayList<PinUI> selection;

		if (name.charAt(0) == 'D') selection = digitalPins;
		else if (name.charAt(0) == 'A') selection = analogPins;
		else return null;

		int pn = parseInt (name.substring(1, name.length()));
		return selection.get(pn);
	}
}