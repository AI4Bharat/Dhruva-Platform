#!/bin/bash

BUILD_DIR=./out

function copy_files {
    for file in *; do
        if [ -d "$file" ]; then
            cd "$file"
            copy_files
            cd ..
        elif [ -f "$file" ] ; then
            
            if [[ $file == *.html ]] ; then
                if [[ $file == index.html ]] ; then
                    continue
                fi
                filename="${file%.*}"
                mkdir -p $filename
                cp $file $filename/index.html
            fi
        fi
    done
}


rm -r $BUILD_DIR
yarn build
yarn export

cd $BUILD_DIR
copy_files
cd ..
