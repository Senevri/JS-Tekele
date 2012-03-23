"""
    Serves http.
"""

import socketserver

class MyTCPHandler(socketserver.BaseRequestHandler):
    path = '/home/esa/tekele/JS-Tekele'
    buffer = []

    header = "HTTP/1.1 200 OK\r\nConnection: close\r\n \
            Content-Type: text/html; charset=UTF-8"
    def handle(self):
        import struct
        import base64
        self.data = self.request.recv(1024).strip()
        self.buffer.append(self.data)
        print(self.client_address[0], self.data)
        strbytes = str(self.data)
        lines = strbytes.lstrip('b').strip("'").split('\\r\\n')
        reply = ""
        try: 
            for cmd, param in [l.split(' ', 1) for l in lines]:
                if cmd.upper() == 'GET':
                    file_req = param.split(' ', 1)[0]
                    if file_req == '/':
                        file_req = '/index.html'
                    print(file_req)
                    f = open(''.join([self.path, file_req]), 'r')
                    try:
                        reply = f.read()
                    except UnicodeDecodeError as e:
                        # serve binary file
                        f.close()
                        f = open(''.join([self.path, file_req]), 'rb')
                        reply=f.read()
                        self.header = '\r\n'.join([self.header, 
                            'Content-Encoding: binary'])

                    finally:
                        f.close()
        except ValueError:
            print (strbytes)

        c_len = "Content-Length: {}\r\n".format(len(reply))
        header = "HTTP/1.1 404 FAILED\r\n\r\n"
        if len(reply)>0:
            if type(reply) == str:
                reply = '\r\n'.join([self.header, c_len, reply])
                self.request.send(reply.encode())
            else:
                self.request.send(reply)

        

if __name__ == "__main__":
    HOST, PORT = "localhost", 9999

    # Create the server, binding to localhost on port 9999
    server = socketserver.TCPServer((HOST, PORT), MyTCPHandler)

    # Activate the server; this will keep running until you
    # interrupt the program with Ctrl-C
    server.serve_forever()
