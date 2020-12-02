from flask import Flask, render_template, request, jsonify, make_response
import random
import time

import json

import dask.dataframe as dd
import numpy as np

app = Flask(__name__)

class NumpyEncoder(json.JSONEncoder):
    """ Custom encoder for numpy data types """
    def default(self, obj):
        if isinstance(obj, (np.int_, np.intc, np.intp, np.int8,
                            np.int16, np.int32, np.int64, np.uint8,
                            np.uint16, np.uint32, np.uint64)):

            return int(obj)
    
        elif isinstance(obj, (np.float_, np.float16, np.float32, np.float64)):
            return float(obj)
        
        elif isinstance(obj, (np.complex_, np.complex64, np.complex128)):
            return {'real': obj.real, 'imag': obj.imag}
        
        elif isinstance(obj, (np.ndarray,)):
            return obj.tolist()
    
        elif isinstance(obj, (np.bool_)):
            return bool(obj)

        elif isinstance(obj, (np.void)): 
            return None

        return json.JSONEncoder.default(self, obj)

## Loading data
dtypes = {
    'BenefitName': np.str, 'BusinessYear': np.uint16, 'CoinsOutofNet':np.str, 'EHBVarReason':np.str, 'Explanation':np.str, 'PlanId':np.str,
       'RowNumber':np.uint16, 'SourceName':np.str, 'StandardComponentId':np.str, 'StateCode':np.str,
       'StateCode2':np.str, 'VersionNum':np.uint16
}
data = dd.read_csv('BenefitsCostSharing.csv', dtype=dtypes, usecols=dtypes.keys())
data.reset_index(drop=True).compute()

@app.route("/")
def index():
    """ Route to render the HTML """
    return render_template("index.html")


@app.route("/filter", methods=['POST'])
def load():
    """ Route to return the posts """
    req_data = request.get_json()
    print(req_data)
    query = build_query(req_data["filters"])
    params = req_data["params"]
    offset = params.get("offset", 0)
    limit = 10
    try:
        query_data = run_query(query, offset, limit)
        return make_response(json.dumps({"total":0, "rows":query_data}, cls=NumpyEncoder), 200)
    except Exception as e:
        return make_response(f"Error: {e}", 400)

def build_query(filters):
    num_keys = ["BusinessYear", "RowNumber", "VersionNum"]
    query = []
    for k,v in filters.items():
        if v:
            if ("<" in v or ">" in v) and k in num_keys:
                query.append(f"({k}{v})")
            elif "==" in v or "!=" in v:
                query.append(f"({k}{v})")
            else:
                
                query.append(f"({k}.str.contains('{v}', regex= True))")
    return " and ".join(query)


def run_query(query, offset=0, limit = 100):
    if query:
        query_data = data.query(query).loc[offset*limit:(offset+1)*limit, :].compute().to_dict(orient="records")
    else:
        query_data = data.loc[offset*limit:(offset+1)*limit, :].compute().to_dict(orient="records")
    # cleaned data

    query_data_clean = [{k: 0 if type(v) == type(np.nan) else v for k, v in d.items()} for d in query_data]
    return query_data_clean


if __name__ == "__main__":
    app.run(debug=True)