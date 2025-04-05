import numpy as np
import random

# Generate random bit string, given the probability of picking one
# `p_of_one = 0`   => constant zero
# `p_of_one = 0.5` => pure random
# `p_of_one = 0.9` => mostly ones
# `p_of_one = 1`   => All ones
def gen_bit_string(length, p_of_one=0.5): 
    assert 0 <= p_of_one and p_of_one <= 1
    return ''.join(np.random.choice(["0","1"], length, p=[1-p_of_one, p_of_one]))

# Generate random bit string, given the "auto-correlation with lag 1"
# Autocorrelation represents the degree of similarity between a 
# given time series and a lagged version of itself over successive time intervals.
# `auto_correlation = 0`   => perfectly alternating 
# `auto_correlation = 0.5` => pure random
# `auto_correlation = 1`   => constant string
def gen_bit_string_with_autocorrelation(length, auto_correlation=0.5): # 0.5 = random
    assert 0 <= auto_correlation <= 1 and length > 0
    signal = ["0"]*length
    signal[0] = random.choice("01")
    for i in range(1,length):
        is_same_as_previous = random.random() < auto_correlation
        signal[i] = signal[i-1] if is_same_as_previous else f"{1-int(signal[i-1])}"
    return ''.join(signal)

def autocorrelation(bit_string):
    return sum([bit_string[i] == bit_string[i-1] for i in range(1, len(bit_string))], 1) / len(bit_string)

def bit_string_to_number(bits: str):
    bits = "1" + bits # Add 1 so that any zero on the left is kept
    return sum(int(c)*(2**i) for i,c in enumerate(bits[::-1]))

def number_to_bit_string(n):
    assert n > 0
    return bin(n)[3:] # remove the 0b, then remove the first one

def shuffle_tree(root):
    for c in root.children:
        shuffle_tree(c)
    
    random.shuffle(root.children)

def fib(n):
    fibn=1
    fibnm1=0
    if n == 0:
        return 0
    
    while n>0:
        t = fibn + fibnm1
        fibnm1 = fibn
        fibn = t
        n -=1

    return fibn

# Returns the largest fibonacci number less or equal to n
def largest_fib(n):
    fibn = 1
    while fib(fibn) <= n:
        fibn+=1
    return fibn-1

def gauss(n):
    return (n*(n+1))//2

def largest_gauss(n):
    gaussn = 1
    while gauss(gaussn) <= n:
        gaussn+=1
    return gaussn-1

def largest_gauss_binsearch(n):
    assert n > 0
    if n == 1:
        return 1
    a = 0
    b = n
    while True:
        r = (a+b)//2
        rsq = gauss(r)
        if rsq <= n and gauss(r+1) > n:
            return r
        else:
            if rsq <= n:
                a = r
            else:
                b = r

def largest_arg_fitting(f, n, use_binsearch=True):
    assert n > 0
    if use_binsearch:
        if n == 1:
            return 1
        a = 0
        b = n
        while True:
            r = (a+b)//2
            rsq = f(r)
            if rsq <= n and f(r+1) > n:
                return r
            else:
                if rsq <= n:
                    a = r
                else:
                    b = r
    else:
        curr_largest = 1
        while f(curr_largest) <= n:
            curr_largest += 1
        return curr_largest-1
    
def largest_value_fitting(f, n, use_binsearch=True):
   return f(largest_arg_fitting(f,n,use_binsearch))

def combinations(n, r):
    if r > n:
        return 0

    numerator = 1
    denominator = 1

    for i in range(r):
        numerator *= n - i
        denominator *= i + 1

    return numerator // denominator

# Computes the mth simplex number in k dimension
def simplex(m, k):
   return combinations(m+k-1, k)