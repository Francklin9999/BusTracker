## Imports
import os
import geopandas as gpd

## Identifying files
data_dir = './stm_sig'
files = os.listdir(data_dir)
shp_files = [file for file in files if '.shp' in file]

## Reading in shps and saving as CSVs
new_data_dir = './test'
for shp_file in shp_files:
    gdf = gpd.read_file(f'{data_dir}/{shp_file}')
    gdf.to_csv(f'{new_data_dir}/{shp_file[:-4]}.csv')