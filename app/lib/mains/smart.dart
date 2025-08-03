import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mangrov/branding.dart';

class SmartSearch extends StatefulWidget {
  const SmartSearch({super.key});

  @override
  State<SmartSearch> createState() => _SmartSearchState();
}

class _SmartSearchState extends State<SmartSearch> {

  Branding br = Branding();
  TextEditingController search = TextEditingController();


  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [

        ListTile(
          title: Text("Looking for a product, but not sure what its called? \nDon't know what to wear to a \nspecific event? \n \nLet's look for it together.".toUpperCase(),
          style: GoogleFonts.inter(
            color: br.white,
            fontWeight: FontWeight.w900,
            fontSize: 14,
            letterSpacing: 1.2
          ),
          ),
        ),
       ListTile(),

        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 10),
                          child: Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  
                                  maxLines: null,
                                  keyboardType: TextInputType.multiline,
                                  style: GoogleFonts.inter(
                                    color: br.white,
                                    fontSize: 14
                                  ),
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
                                        color: Colors.transparent
                                      ),
                                    ),
                                      
                                    //prefixIcon: Icon(Icons.search, color: Colors.grey[600],),
                                      
                                    hintText: 'What are you looking for?',
                                    hintStyle: GoogleFonts.inter(
                                      color: Colors.grey[600],
                                      fontSize: 14
                                    )
                                  ),
                                ),
                              ),

                              IconButton(
                                style: ButtonStyle(
                                  backgroundColor: WidgetStatePropertyAll(br.white),
                                  shape: WidgetStatePropertyAll(RoundedRectangleBorder(
                                    borderRadius: BorderRadiusGeometry.circular(12)
                                  ))
                                ),
                                onPressed: () async {}, 
                                icon: Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 5.0, horizontal: 5),
                                  child: Icon(Icons.upload, color: Colors.green,),
                                )
                              ),
                            ],
                          ),
                        ),


      ],
    );
  }
}