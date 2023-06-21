from warnings import simplefilter
from tree.layouts.layout import PI
from tree.tree import n_branches
import util.vector
from util.vector import vec
from util.vector import Vector
import math, numpy as np

TOL=util.vector.TOL # Tolerance for two numbers considered equal

def geq(n1,n2, abs_tol=TOL):
    return math.isclose(n1,n2, abs_tol=abs_tol)
    
def gleq(n1,n2, abs_tol=TOL):
    return n1 <= n2 or geq (n1, n2)

def seg(segment):
    return Segment(vec(segment.p1), vec(segment.p2), segment.is_line)

class Polygon:
    def __init__(self, vertices):
        self.vertices = vertices

        assert vertices is not None 
        assert len(vertices) > 2
        
        # No duplicates allowed
        for i,v1 in enumerate(vertices):
            for j,v2 in enumerate(vertices):
                assert i == j or v1 != v2

    def __str__(self):
        return str(self.vertices)
    __repr__ = __str__

    def centroid(self):
        return sum(self.vertices, start=Vector(0,0))/len(self.vertices)

    def area(self):
        a = 0
        ox,oy = self.vertices[0].x, self.vertices[0].y
        for v in self.vertices[1:]+[self.vertices[0]]:
            a += (v.x*oy-v.y*ox)
            ox,oy = v.x,v.y
        return a/2

    def segment(self, i):
        assert i < len(self.vertices)
        return Segment(vec(self.vertices[i]), 
                       vec(self.vertices[(i+1)%len(self.vertices)]))

    def has_on_perimeter(self, point):
        return any([point in self.segment(i) for i in range(len(self.vertices))])

    def translate(self, vec):
        for v in self.vertices:
            v += vec
    
    def squash(self, xsquash, ysquash):
        centroid = self.centroid()
        for v in self.vertices:
            v.x = v.x * (1-xsquash) + centroid.x * xsquash
            v.y = v.y * (1-ysquash) + centroid.y * ysquash

    def closest_vertex_to_point_on_perimeter(self, point, left_allowed, right_allowed):
        # Gets the closest vertex to the point.
        # Left and right are considered w.r.t. the centroid of the polygon.
        # Note: Vertices equal to the point are excluded
        cut_line = Segment(point, self.centroid())
        ss = [self.segment(i) for i in range(len(self.vertices))
                                    if point in self.segment(i)]
        cv = None # closest vertex on the left
        vs = [v for s in ss for v in (s.p1, s.p2)]
        for v in vs:
            at_right = cut_line.has_at_right(v)
            dir_ok = right_allowed and at_right
            dir_ok |= left_allowed and not at_right
            dir_ok &= point != v # exclude same points
            if (dir_ok and (cv == None or 
                            Vector.distance(point, v) <
                            Vector.distance(point, cv))):
                cv = v

        return cv

    def cut(self, line):
        # Returns the left and right subpolygons after the 
        # polygon has been cut by the given line. If the line 
        # does not intersect, returns (None, None)
        assert line.is_line

        intersections = [(i, line.intersection(self.segment(i))) 
                             for i in range(len(self.vertices)) 
                             if line.intersection(self.segment(i)) is not None]
        
        if len(intersections) < 2:
            return None, None

        if len(intersections) > 2: # removing duplicate intersections in case on cut on vertex
            uniq_its =[]
            for its in intersections:
                inside = False
                for uits in uniq_its:
                    inside = its[1] == uits[1]
                    if inside: break
                if not inside:
                    uniq_its.append(its)
            intersections = uniq_its

        if len(intersections) != 2:
            return None, None

        assert len(intersections) == 2

        i1,i2 = (intersections[0], intersections[1])  # in the form (vertex index, intersection) 
        assert i1[0] != i2[0]
        if i2[0] < i1[0]: i1,i2 = i2,i1 # ordered pair

        s1 = [Vector(v) for v in self.vertices[i1[0]+1:i2[0]+1]]
        l_vs = [vec(i1[1])] + s1 + [vec(i2[1])]

        s2 = [Vector(v) for v in self.vertices]
        r_vs = [vec(i1[1]), vec(i2[1])] + s2[i2[0]+1:] + s2[:i1[0]+1]

        assert len(l_vs) > 2       
        assert len(r_vs) > 2   

        # Removing duplicates (edge case in which intersection = vertex)
        l_vs = [v for i,v in enumerate(l_vs[1:]+[l_vs[0]], 1) if v != l_vs[i-1]]
        r_vs = [v for i,v in enumerate(r_vs[1:]+[r_vs[0]], 1) if v != r_vs[i-1]]

        if len(l_vs) < 2 or len(r_vs) < 2:
            return None, None  # edge case in which cutting line is tangent

        # Finally, make sure that lsec is actually on the left
        lsec = Polygon(l_vs)
        rsec = Polygon(r_vs)
        lvr = [line.has_at_right(v) for v in lsec.vertices 
                                    if v != i1[1] and v != i2[1]]
        rvr = [line.has_at_right(v) for v in rsec.vertices
                                    if v != i1[1] and v != i2[1]]
        l_at_right = all(lvr)
        r_at_right = all(rvr)
        assert l_at_right or r_at_right # at least one should be at right
        if l_at_right and not r_at_right:
            lsec, rsec = rsec, lsec
            # It's a complicated matter, as in some edge cases they could
            # both be at right, as has_at_right is inclusive. 
            # Imagine a polygon with zero area which is
            # basically a line. In such case I would expect the code to
            # fail before, but let's handle the case

        return lsec, rsec

    def cut_area_percentage(self, line, max_angle, lsec_perc):
        # Returns a cut in which subsections have area perc, 1-perc.
        # The line can be rotated from 0 to max_angle.
        # It is assumed that increasing the angle increases the area
        # It is assumed that the line points inwards in the polygon, 
        # So that the cut with angle 0 is a valid cut.
        # Only works on convex polygons
        assert line.is_line
        assert self.has_on_perimeter(line.p1)
        assert 0 <= max_angle <= 2*PI

        lsec,_ = self.cut(line)
        assert lsec is not None # Angle 0 must be a valid cut

        return self._cut_area_percentage(line, 0, max_angle, lsec_perc)

    def _cut_area_percentage(self, line, mina, maxa, lsec_perc):
        trot = (mina + maxa) / 2
        rot_line = seg(line)
        rot_line.rotate(trot)

        lsec,rsec = self.cut(rot_line)

        if lsec is None:
            if geq(mina,maxa): 
                assert False # Should never get here
            else:
                # Assuming that going over the area means that the angle was too
                # big. May fail if the line does not point to the inside of 
                # the polygon. This is checked in the wrapper function
                return self._cut_area_percentage(line, mina, trot, lsec_perc)

        lsec2_area = lsec.area()
        tot_area = self.area()
        perc = lsec2_area / tot_area
        if geq(perc, lsec_perc):
            return lsec, rsec
        elif geq(mina, maxa):
            # There is exact solution :(
            return lsec, rsec
        elif perc < lsec_perc:
            return self._cut_area_percentage(line, trot, maxa, lsec_perc)
        else:
            return self._cut_area_percentage(line, mina, trot, lsec_perc)

    @staticmethod
    def circle(center, radius, n_vertices):
        assert n_vertices > 2

        vs = [Vector(math.cos(a), math.sin(a))*radius + center for a in np.linspace(math.pi/2.,-math.pi*3/2, n_vertices, endpoint=False)]
        return Polygon(vs)

class Segment:
    def __init__(self, p1, p2, is_line=False):
        self.p1 = p1
        self.p2 = p2
        self.is_line = is_line

    def __str__(self) -> str:
        return f"{self.p1} -> {self.p2}"
    __repr__ = __str__
    
    def __contains__(self, vec):
        x1,y1 = self.p1.x, self.p1.y
        x2,y2 = self.p2.x, self.p2.y
        x3,y3 = vec.x, vec.y

        if geq(x1,x2): # vertical line
            return geq(x2,x3) and (self.is_line 
                              or (gleq (y1,y3) and gleq(y3,y2)) 
                              or (gleq (y2,y3) and gleq(y3,y1)) )
        if geq(y1,y2): # horizontal line
            return geq(y2,y3) and (self.is_line 
                              or (gleq (x1,x3) and gleq(x3,x2)) 
                              or (gleq (x2,x3) and gleq(x3,x1)) )

        tx = (x3-x2)/(x1-x2)
        ty = (y3-y2)/(y1-y2)

        return geq(tx, ty) and (self.is_line or (gleq(0,tx) and gleq(tx, 1)))

    def translate(self, vec):
        self.p1 +=vec
        self.p2 +=vec    
        
    def rotate(self, radiants):
        # rotates p2 around p1
        self.p2 = self.p2.rotate(self.p1, radiants)

    def has_at_right(self, point):
        dir = self.p2 - self.p1 # center in zero
        p = point - self.p1
        sangle = Vector.signed_angle(dir, p) 
        return sangle >= 0

    def set_length(self, length):
        # Moves p2 to reach the requested length
        self.p2 = (self.p2 - self.p1).getNormalized()*length + self.p1

    def intersection(self, line):
        x1,y1 = self.p1.x, self.p1.y
        x2,y2 = self.p2.x, self.p2.y
        x3,y3 = line.p1.x, line.p1.y
        x4,y4 = line.p2.x, line.p2.y

        dx1 = x2 - x1
        dx2 = x4 - x3
        dy1 = y2 - y1
        dy2 = y4 - y3
        dx3 = x1 - x3
        dy3 = y1 - y3

        det = dx1 * dy2 - dx2 * dy1
        det1 = dx1 * dy3 - dx3 * dy1
        det2 = dx2 * dy3 - dx3 * dy2

        if geq(det,0.0):  # lines are parallel
            if not geq(det1,0.0) \
               or not geq(det2,0.0):  # lines are not co-linear
                return None  # so no solution

            if self.p1 in line: return vec(self.p1) 
            if self.p2 in line: return vec(self.p2)
            if line.p1 in self: return vec(line.p1)
            if line.p2 in self: return vec(line.p2)
            assert False # Should never reach here

        s = det1 / det
        t = det2 / det
        sok = line.is_line or (0.0 <= s <= 1.0)
        tok = self.is_line or (0.0 <= t <= 1.0)
        if sok and tok:
            return Vector(x1 + t * dx1, y1 + t * dy1)