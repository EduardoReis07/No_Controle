document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    
    /* Banco de Dados */
    var sqlite = window.sqlitePlugin.openDatabase({ name: "AppGastos", location: 'default' });
    
    function CreateTable() {
        sqlite.transaction(function (transaction) {
            transaction.executeSql(
                "CREATE TABLE IF NOT EXISTS gastos (name varchar(70) not null unique primary key, value doble)", [],

                (tx, result) => console.log("Tabela Criada com sucesso"),

                error => console.log("Um ERRO ocorreu durante a criacao da tabela")
            );
        });
    }

    CreateTable(); // Cria uma tabela no banco caso ela não exista

    function ListOfRegisteredExpenses() {
        sqlite.transaction((transaction) => {
            transaction.executeSql('SELECT * FROM gastos', [], (tx, results) => {
                let gastos = results.rows.length,
                    i;

                for (i = 0; i < gastos; i++) {
                    $('#list').append(
                        '<div class="list__item">' + results.rows.item(i).name +
                        '.........R$' + results.rows.item(i).value +
                        '<button type="button" class="deleteItem" onclick="deleteItem(this)">X</button>' +
                        '</div>'
                    );            
                }

                sumOfValues(); // Faz a soma dos valores cadastrados no banco
            }, null);
        });
    }

    ListOfRegisteredExpenses(); // Lista os gastos já salvos

    const divMain = document.getElementById('main');
    const divForm = document.getElementById('form');

    function FormVisible() {
        
        function Visible() {
            const btnForm = document.getElementById('btnForm');

            btnForm.addEventListener('click', () => {
                divMain.classList.add('hidden');
                divForm.classList.remove('hidden');
            });
        }

        function Invisible() {
            const btnCancel = document.getElementById('btnCancel');

            btnCancel.addEventListener('click', () => {
                divMain.classList.remove('hidden');
                divForm.classList.add('hidden');
            });
        }

        Visible();
        Invisible();
    }

    FormVisible(); // Mostra e Oculta o Formulário na Página Principal

    $('#btnAdd').click(() => { // Adiciona um Item na Lista do Menu Principal e no Banco de Dados
        var $nameItem = $('#name').val();
        var $valueItem = $('#value').val();

        if ($nameItem.length > 0 && $valueItem.length > 0) {
            sqlite.transaction((transaction) => {
                let Query = "INSERT INTO gastos (name, value) VALUES (?, ?)";

                transaction.executeSql(Query, [$nameItem, $valueItem], (tx, result) => {
                
                    $('#list').append(
                        '<div class="list__item">' + $nameItem +
                        '.........R$' + $valueItem +
                        '<button type="button" class="deleteItem" onclick="deleteItem(this)">X</button>' +
                        '</div>'
                        );
        
                },
                    error => {
                        function alertCallBack() {
                            navigator.vibrate(400);
                            console.log($nameItem + " - R$" + $valueItem);
                        }

                        navigator.notification.alert(
                            'Ocorreu um erro ao tentar inserir um item na lista, veja se inseriu corretamente os valores ou se já existe um item com este nome.',
                            alertCallBack,         
                            'Ocorreu um ERRO',     
                            'Ok'                   
                        );
                    }
                );
            });
             
            divMain.classList.remove('hidden');
            divForm.classList.add('hidden');
             
            $('#name').val("");
            $('#value').val("");

            sumOfValues();
        }
    });   

    function sumOfValues() {
        sqlite.transaction(transaction => {
            let sql = "SELECT sum(value) as total FROM gastos;"

            transaction.executeSql(sql, [],
                (tx, results) => {
                        var tamanho = results.rows.length;

                        for (let i = 0; i < tamanho; i++) {
                            var item = results.rows.item(i);
                            var TotalDatabase = parseFloat(item.total);
                            var TotalConvertido = (TotalDatabase);

                            var ValorTotal = Number.isNaN(TotalConvertido) ? 0 : TotalConvertido.toFixed(2);

                            //console.log(ValorTotal);

                            $('#totalGasto').text("Total:  R$" + ValorTotal);       
                        }
                     
                    
                },
                error => {
                    console.log(error);
            })
        });
    }

    $('#drop').click(() => {

        navigator.notification.confirm(
            'Você deseja deletar todos os itens da sua lista de gastos?',
            onConfirm,
            'EXCLUIR TODOS OS ITENS?',
            ['Sim', 'Cancelar']
        );

        function onConfirm(buttonIndex) {
            if (buttonIndex == 1) {
                sqlite.transaction(transaction => {
                    var sql = "DELETE FROM gastos;";

                    transaction.executeSql(sql, [],
                        function (tx, result) {

                            function alertCallBack() {
                                navigator.vibrate(600);
                                $(".list__item").remove();
                                sumOfValues();
                            }

                            navigator.notification.alert(
                                'Sua lista foi apagada com sucesso!',
                                 alertCallBack,
                                'Tudo Pronto!',            
                                'OK'                  
                            );

                        },
                        function (error) {
                            console.log(error);
                        });
                });
            }
            else {
                console.log("A operação foi cancelada");
            }
        }
        
    });
}