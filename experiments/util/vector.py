"""vector.py: A simple little Vector class. Enabling basic vector math. """

__author__      = "Sven Hecht"
__license__ = "GPL"
__version__ = "1.0.1"
__maintainer__ = "Sven Hecht"
__email__ = "info@shdev.de"
__status__ = "Production"

from random import *
from math import *

TOL = 0.000001

def vec(v): # new copy of vector
	return Vector(v.x, v.y)

class Vector:
	def __init__(self, x=0, y=0):
		self.x = 0
		self.y = 0
		if isinstance(x, tuple) or isinstance(x, list):
			y = x[1]
			x = x[0]
		elif isinstance(x, Vector):
			y = x.y
			x = x.x
		
		self.set(x,y)

	@staticmethod
	def random(size=1):
		sizex = size
		sizey = size
		if isinstance(size, tuple) or isinstance(size, list):
			sizex = size[0]
			sizey = size[1]
		elif isinstance(size, Vector):
			sizex = size.x
			sizey = size.y
		return Vector(random() * sizex, random() * sizey)

	@staticmethod
	def randomUnitCircle():
		d = random()*pi
		return Vector(cos(d)*choice([1,-1]), sin(d)*choice([1,-1]))

	@staticmethod
	def distance(a, b):
		return (a - b).getLength()

	@staticmethod
	def angle(v1, v2):
	  return acos(v1.dotproduct(v2) / (v1.getLength() * v2.getLength()))
	
	@staticmethod
	def signed_angle(v1,v2):
		return atan2( v1.x*v2.y - v1.y*v2.x, v1.x*v2.x + v1.y*v2.y )

	@staticmethod
	def angleDeg(v1, v2):
	  return Vector.angle(v1,v2) * 180.0 / pi
	
	@staticmethod
	def lerp(v1, v2, t):
	  return v2*t + v1*(1-t)
	
	def set(self, x,y):
		self.x = x
		self.y = y
	
	def toArr(self): return [self.x, self.y]
	def toInt(self): return Vector(int(self.x), int(self.y))
	def toIntArr(self): return self.toInt().toArr()

	def getNormalized(self): 
		if self.getLength() != 0:
			return self / self.getLength()
		else: return Vector(0,0)

	def rotate(self, origin, radians):
		ox, oy = origin.x, origin.y
		px, py = self.x, self.y

		qx = ox + cos(radians) * (px - ox) - sin(radians) * (py - oy)
		qy = oy + sin(radians) * (px - ox) + cos(radians) * (py - oy)

		return Vector(qx, qy)
	
	def dotproduct(self, other):
		if isinstance(other, Vector):
			return self.x * other.x + self.y * other.y
		elif  isinstance(other, tuple) or isinstance(other, list):
			return self.x * other[0] + self.y * other[1]
		else:
			return NotImplemented
	def __add__(self, other):
		if isinstance(other, Vector):
			return Vector(self.x + other.x, self.y + other.y)
		elif  isinstance(other, tuple) or isinstance(other, list):
			return Vector(self.x + other[0], self.y + other[1])
		elif isinstance(other, int) or isinstance(other, float):
			return Vector(self.x + other, self.y + other)
		else:
			return NotImplemented
	def __sub__(self, other):
		if isinstance(other, Vector):
			return Vector(self.x - other.x, self.y - other.y)
		if  isinstance(other, tuple) or isinstance(other, list):
			return Vector(self.x - other[0], self.y - other[1])
		elif isinstance(other, int) or isinstance(other, float):
			return Vector(self.x - other, self.y - other)
		else:
			return NotImplemented
	def __rsub__(self, other):
		if isinstance(other, Vector):
			return Vector(other.x - self.x, other.y - self.y)
		elif isinstance(other, tuple) or isinstance(other, list):
			return Vector(other[0] - self.x, other[1] - self.y)
		elif isinstance(other, int) or isinstance(other, float):
			return Vector(other - self.x, other - self.y)
		else:
			return NotImplemented
	def __mul__(self, other):
		if isinstance(other, Vector):
			return Vector(self.x * other.x, self.y * other.y)
		elif  isinstance(other, tuple) or isinstance(other, list):
			return Vector(self.x * other[0], self.y * other[1])
		elif isinstance(other, int) or isinstance(other, float):
			return Vector(self.x * other, self.y * other)
		else:
			return NotImplemented
	def __truediv__(self, other):
		if isinstance(other, Vector):
			return Vector(self.x / other.x, self.y / other.y)
		elif  isinstance(other, tuple) or isinstance(other, list):
			return Vector(self.x / other[0], self.y / other[1])
		elif isinstance(other, int) or isinstance(other, float):
			return Vector(self.x / other, self.y / other)
		else:
			return NotImplemented
	def __rdiv__(self, other):
		if isinstance(other, Vector):
			return Vector(other.x / self.x, other.y / self.y)
		elif  isinstance(other, tuple) or isinstance(other, list):
			return Vector(other[0] / self.x, other[1] / self.y)
		elif isinstance(other, int) or isinstance(other, float):
			return Vector(other / self.x, other / self.y)
		else:
			return NotImplemented
	def __pow__(self, other):
		if isinstance(other, int) or isinstance(other, float):
			return Vector(self.x ** other, self.y ** other)
		else:
			return NotImplemented
	
	def __iadd__(self, other):
		if isinstance(other, Vector):
			self.x += other.x
			self.y += other.y
			return self
		elif  isinstance(other, tuple) or isinstance(other, list):
			self.x += other[0]
			self.y += other[1]
			return self
		elif isinstance(other, int) or isinstance(other, float):
			self.x += other
			self.y += other
			return self
		else:
			return NotImplemented
	def __isub__(self, other):
		if isinstance(other, Vector):
			self.x -= other.x
			self.y -= other.y
			return self
		elif  isinstance(other, tuple) or isinstance(other, list):
			self.x -= other[0]
			self.y -= other[1]
			return self
		elif isinstance(other, int) or isinstance(other, float):
			self.x -= other
			self.y -= other
			return self
		else:
			return NotImplemented
	def __imul__(self, other):
		if isinstance(other, Vector):
			self.x *= other.x
			self.y *= other.y
			return self
		elif  isinstance(other, tuple) or isinstance(other, list):
			self.x *= other[0]
			self.y *= other[1]
			return self
		elif isinstance(other, int) or isinstance(other, float):
			self.x *= other
			self.y *= other
			return self
		else:
			return NotImplemented
	def __idiv__(self, other):
		if isinstance(other, Vector):
			self.x /= other.x
			self.y /= other.y
			return self
		elif  isinstance(other, tuple) or isinstance(other, list):
			self.x /= other[0]
			self.y /= other[1]
			return self
		elif isinstance(other, int) or isinstance(other, float):
			self.x /= other
			self.y /= other
			return self
		else:
			return NotImplemented
	def __ipow__(self, other):
		if isinstance(other, int) or isinstance(other, float):
			self.x **= other
			self.y **= other
			return self
		else:
			return NotImplemented
	
	def __eq__(self, other):
		if isinstance(other, Vector):
			return isclose(self.x, other.x, abs_tol=TOL) and \
				   isclose(self.y, other.y, abs_tol=TOL)
		else:
			return NotImplemented
	
	def __ne__(self, other):
		if isinstance(other, Vector):
			return not self == other
		else:
			return NotImplemented
	def __gt__(self, other):
		if isinstance(other, Vector):
			return self.getLength() > other.getLength()
		else:
			return NotImplemented
	def __ge__(self, other):
		if isinstance(other, Vector):
			return self.getLength() >= other.getLength()
		else:
			return NotImplemented
	def __lt__(self, other):
		if isinstance(other, Vector):
			return self.getLength() < other.getLength()
		else:
			return NotImplemented
	def __le__(self, other):
		if isinstance(other, Vector):
			return self.getLength() <= other.getLength()
		else:
			return NotImplemented
	
	
	def __len__(self):
		return int(sqrt(self.x**2 + self.y**2))
	def getLength(self):
		return sqrt(self.x**2 + self.y**2)
		
	def __getitem__(self, key):
		if key == "x" or key == "X" or key == 0 or key == "0":
			return self.x
		elif key == "y" or key == "Y" or key == 1 or key == "1":
			return self.y
	
	def __str__(self): return "[x: %(x)f, y: %(y)f]" % self
	def __repr__(self): return "{'x': %(x)f, 'y': %(y)f}" % self

	def __neg__(self): return Vector(-self.x, -self.y)

ZERO = Vector(0,0)