
import numpy as np
import tritonclient.http as http_client
from tritonclient.utils import np_to_triton_dtype

def pad_batch(batch_data):
    batch_data_lens = np.asarray([len(data) for data in batch_data], dtype=np.int32)
    max_length = max(batch_data_lens)
    batch_size = len(batch_data)

    padded_zero_array = np.zeros((batch_size, max_length),dtype=np.float32)
    for idx, data in enumerate(batch_data):
        padded_zero_array[idx,0:batch_data_lens[idx]] = data
    return padded_zero_array, np.reshape(batch_data_lens,[-1,1])


def get_string_tensor(string_value, tensor_name):
    string_obj = np.array([string_value], dtype="object")
    input_obj = http_client.InferInput(tensor_name, string_obj.shape, np_to_triton_dtype(string_obj.dtype))
    input_obj.set_data_from_numpy(string_obj)
    return input_obj