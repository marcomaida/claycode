class bit_stream_text:
    def __init__(self, text):
        self._text = text
        self.reset()
    
    def next(self):
        if self._finished:
            return 0 # Once finished, the stream returns only zeros
        elif self._ptr >= len(self._text):
            self._finished = True
            return 1 # Final extra 1
        else:
            byte = format(ord(self._text[self._ptr]), 'b')
            bit = byte[self._subptr]
            if self._subptr == len(byte)-1:
                self._subptr = 0
                self._ptr += 1
            else:
                self._subptr += 1

            return int(bit)

    def is_finished(self):
        return self._finished

    def reset(self):
        self._ptr = 0
        self._subptr = 0
        self._finished = False

        
class bit_stream_number:
    def __init__(self, n):
        self._n = f"{n:b}"
        self.reset()
    
    def next(self):
        if self._finished:
            return 0 # Once finished, the stream returns only zeros
        elif self._ptr >= len(self._n):
            self._finished = True
            return 1 # Final extra 1
        else:
            bit = self._n[self._ptr]
            self._ptr += 1
            return int(bit)

    def is_finished(self):
        return self._finished

    def reset(self):
        self._ptr = 0
        self._finished = False

class bit_stream_literal:
    def __init__(self, array):
        self._array = array
        self.reset()
    
    def next(self):
        if self._finished:
            return 0 # Once finished, the stream returns only zeros
        elif self._i >= len(self._array):
            self._finished = True
            return 1 # Final extra 1
        else:
            bit = self._array[self._i]
            assert bit == 1 or bit == 0
            self._i += 1
            return bit

    def is_finished(self):
        return self._finished

    def reset(self):
        self._i = 0
        self._finished = False