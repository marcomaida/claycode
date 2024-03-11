from text_bit.bit_string import BitString

"""
Generic encoding that is not specialised in anything.
Serves the purpose of capturing all edge cases. 
Currently Unicode
"""
class UmbrellaEncoding:
    def text_to_bit(text):
        # Encode the text to bytes using UTF-8 encoding
        encoded_bytes = text.encode('utf-8')
        # Convert each byte to its binary representation and concatenate
        bit_string = ''.join(format(byte, '08b') for byte in encoded_bytes)
        return BitString(bit_string)

    def bit_to_text(bit_string):
        # Split the bit string into 8-bit chunks
        byte_array = [int(bit_string[i:i+8]) for i in range(0, len(bit_string), 8)]
        # Convert the list of byte values to a bytes object
        bytes_obj = bytes(byte_array)
        # Decode the bytes object using UTF-8 to get the original text
        text = bytes_obj.decode('utf-8')
        return text

