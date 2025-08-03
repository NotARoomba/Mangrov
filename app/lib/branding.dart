import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class Branding {
  
  Color black = const Color.fromARGB(255, 9, 9, 9);
  Color grey = Colors.grey[900]!;
  Color white = const Color.fromARGB(255, 250, 250, 250);
  Color bg = const Color.fromARGB(255, 25, 24, 24);


  Widget button(void Function() onpressed, String string) {

    return SizedBox(
      width: double.infinity,
      child: TextButton(
        style: ButtonStyle(
          backgroundColor: WidgetStatePropertyAll(Colors.green,),
          shape: WidgetStatePropertyAll(RoundedRectangleBorder(
            borderRadius: BorderRadiusGeometry.circular(50)
          ))
        ),
        onPressed: onpressed, 
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 10.0),
          child: Text(string.toUpperCase(), 
          style: GoogleFonts.inter(
            letterSpacing: 1.2,
            fontSize: 15,
            color: white,
            fontWeight: FontWeight.w900
          ),
          ),
        )
      ),
    );
  }


  List<String> interests = [
    'Gardening',
    'Fashion', 
    'Jewelry',
    'Sports & Fitness', 
    'Animals',
    'Pottery',
    'Yoga',
    'Home Decor',
    'Makeup',
    'Skincare',
    'Wellness', 
    'Nutrition', 
    'Hair Care',
  ];

}