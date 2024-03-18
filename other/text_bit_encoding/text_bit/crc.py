from text_bit.bit_string import BitString



class Crc:
    POLY32_IEEE = '04C11DB7' # IEEE 802.3 standard
    POLY16_ANSI = '8005' # CRC-16-ANSI

    def __init__(self, poly, crc_length):
        self.poly = poly
        self.crc_length = crc_length

    # Computes the CRC for the given bit string
    def compute_crc(self, bit_string):
        # Convert the polynomial from hex string to binary string
        poly_bin = BitString(format(int(self.poly, 16), f'0{self.crc_length}b'))
        
        # Append zeroes to the bit string
        padded_bit_string = bit_string + ('0' * (self.crc_length - 1))
        
        # Perform division using bitwise XOR
        def xor(dividend, divisor):
            result = int(dividend) ^ int(divisor)
            return BitString(format(result, f'0{len(dividend)}b'))
        
        # Slice the bit string to the size of the polynomial for the initial division
        tmp = padded_bit_string[0:self.crc_length]
        
        for i in range(self.crc_length - 1, len(padded_bit_string)):
            if tmp[0] == '1': # Perform XOR if the leftmost bit is 1
                tmp = xor(tmp, poly_bin) + padded_bit_string[i]
            else: # If the leftmost bit is 0, simply remove it and append the next bit
                tmp = tmp[1:] + padded_bit_string[i]
        
        # Final XOR might be needed based on specific CRC implementation
        msg = tmp if tmp[0] == '1' else xor(tmp, poly_bin)
        
        return self.get_crc(msg)

    # Returns whether the CRC is valid
    def validate_crc(self, bit_string_with_crc):
        # Compute the CRC of the input bit string including the existing CRC
        result_crc = self.compute_crc(bit_string_with_crc[:-self.crc_length])
        # Compare the computed CRC with the one appended to the bit string
        return result_crc == self.get_crc(bit_string_with_crc)
   
    # Gets the CRC from the message 
    def get_crc(self, bit_string):
        return bit_string[-self.crc_length:]
    
    # Returns the input string without the CRC
    def remove_crc(self, bit_string):
        return bit_string[:-self.crc_length]