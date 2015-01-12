#Zip Server
echo "zipServer"
#for the firest time
#zip -r ./Server_mx_game.zip ./* --exclude=*runtime* -x *log_* .* uploadWebGame.sh
zip -r ./Server_mx_game.zip ./* --exclude=*runtime* --exclude=*frameworks* -x *log_* .* uploadWebGame.sh

#only publish folder
#cd ./publish/html5/


zip -r ./Server_mx_game.zip ./* -X *.DS_Store
#mv ./Server_mx_game.zip ../../
#cd ../../

ls -l | grep Server_mx_game.zip

#read -p "Any Key to Continue..." var
read -p "choose target [ product(p) / testing(t) / cancel(c) ] ..." choice

if [ "$choice" = "p" ]
    then
    echo "your choice is product"
    echo "upload to remote server"
    scp -i ~/.ssh/zbeans.pem ./Server_mx_game.zip ec2-user@amazon_server:~/Documents/
    echo "run deploy_mx_game.sh in amazon Server"
    ssh -i ~/.ssh/zbeans.pem ec2-user@amazon_server "cd Documents && ls -la && sh ./deploy_mx_game.sh"
elif [ "$choice" = "t" ]
then
    echo "your choice is cancel"
else
    echo "your choice is cancel"
fi



#remove zip file
echo "remove zip file"
rm ./Server_mx_game.zip
