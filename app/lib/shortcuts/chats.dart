import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mangrov/branding.dart';

class Chats extends StatefulWidget {
  const Chats({super.key});

  @override
  State<Chats> createState() => _ChatsState();
}

class _ChatsState extends State<Chats> {

  Branding br = Branding();
  TextEditingController search = TextEditingController();


  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
      },
      child: Scaffold(
        backgroundColor: br.black,
        appBar: AppBar(
            backgroundColor: br.black,
            iconTheme: IconThemeData(
              color: Colors.grey[800],
              size: 20
            ),
            centerTitle: false,
            title: Text('Chats & Messages',
            style: GoogleFonts.inter(
              color: br.white,
              fontWeight: FontWeight.w600
            ),
            ),
          ),
      
          body: SingleChildScrollView(
            scrollDirection: Axis.vertical,
            child: Column(
              children: [
      
                Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 10),
                          child: TextField(
                            
                            controller: search,
                            cursorColor: Colors.green,
                            decoration: InputDecoration(
                              filled: true,
                              fillColor: const Color.fromARGB(255, 27, 27, 27),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: const Color.fromARGB(255, 27, 27, 27)
                                ),
                              ),
                                
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: Colors.green
                                ),
                              ),
                                
                              prefixIcon: Icon(Icons.search, color: Colors.grey[600],),
                                
                              hintText: 'Search...',
                              hintStyle: GoogleFonts.inter(
                                color: Colors.grey[600],
                                fontSize: 14
                              )
                            ),
                          ),
                        ),
      
                        
              ],
            ),
          ),
      ),
    );
  }
}